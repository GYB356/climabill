import { firestore } from '../firebase/config';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  Timestamp 
} from 'firebase/firestore';
import { CARBON_DEFAULTS, OffsetProjectType, OffsetPurchaseStatus, PaymentGateway } from './config';
import { CarbonTrackingService, CarbonOffset } from './carbon-tracking-service';
import { StripeService } from '../billing/stripe-service';
import { PayPalService } from '../billing/paypal-service';

/**
 * Interface for offset donation
 */
export interface OffsetDonation {
  id?: string;
  userId: string;
  organizationId?: string;
  carbonInKg: number;
  amountInUsdCents: number;
  paymentGateway: PaymentGateway;
  paymentId?: string;
  status: OffsetPurchaseStatus;
  projectType?: OffsetProjectType;
  offsetId?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Service for handling carbon offset donations and payments
 */
export class CarbonOffsetService {
  private carbonTrackingService: CarbonTrackingService;
  private stripeService: StripeService;
  private paypalService: PayPalService;
  private readonly DONATION_COLLECTION = 'carbonDonations';
  
  constructor() {
    this.carbonTrackingService = new CarbonTrackingService();
    this.stripeService = new StripeService();
    this.paypalService = new PayPalService();
  }
  
  /**
   * Create a donation intent
   * @param userId User ID
   * @param carbonInKg Amount of carbon to offset in kg CO2e
   * @param paymentGateway Payment gateway to use
   * @param projectType Optional project type preference
   * @param organizationId Optional organization ID
   * @returns Donation intent with payment details
   */
  async createDonationIntent(
    userId: string,
    carbonInKg: number,
    paymentGateway: PaymentGateway,
    projectType?: OffsetProjectType,
    organizationId?: string
  ): Promise<{
    donationId: string;
    clientSecret?: string;
    paymentUrl?: string;
    estimatedAmount: number;
    estimatedCost: string;
  }> {
    try {
      // Get offset estimate
      const estimate = await this.carbonTrackingService.estimateOffset(carbonInKg, projectType);
      
      // Ensure minimum amount
      const amountInUsdCents = Math.max(
        estimate.costInUsdCents,
        CARBON_DEFAULTS.minimumOffsetAmount * 100
      );
      
      // Create donation record
      const donation: Omit<OffsetDonation, 'id'> = {
        userId,
        organizationId,
        carbonInKg,
        amountInUsdCents,
        paymentGateway,
        status: OffsetPurchaseStatus.PENDING,
        projectType,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      // Save to Firestore
      const docRef = await addDoc(collection(firestore, this.DONATION_COLLECTION), donation);
      
      // Create payment intent based on gateway
      let clientSecret: string | undefined;
      let paymentUrl: string | undefined;
      
      if (paymentGateway === PaymentGateway.STRIPE) {
        // Create Stripe payment intent
        const paymentIntent = await this.stripeService.createPaymentIntent({
          amount: amountInUsdCents,
          currency: 'usd',
          metadata: {
            donationId: docRef.id,
            carbonInKg: carbonInKg.toString(),
            userId,
            organizationId: organizationId || '',
            type: 'carbon_offset',
          },
        });
        
        clientSecret = paymentIntent.client_secret;
        
        // Update donation with payment ID
        await updateDoc(doc(firestore, this.DONATION_COLLECTION, docRef.id), {
          paymentId: paymentIntent.id,
          updatedAt: Timestamp.now(),
        });
      } else if (paymentGateway === PaymentGateway.PAYPAL) {
        // Create PayPal order
        const order = await this.paypalService.createOrder({
          amount: amountInUsdCents / 100, // PayPal uses dollars, not cents
          currency: 'USD',
          description: `Carbon offset for ${carbonInKg} kg CO2e`,
          custom_id: docRef.id,
          metadata: {
            donationId: docRef.id,
            carbonInKg: carbonInKg.toString(),
            userId,
            organizationId: organizationId || '',
            type: 'carbon_offset',
          },
        });
        
        paymentUrl = order.approvalUrl;
        
        // Update donation with payment ID
        await updateDoc(doc(firestore, this.DONATION_COLLECTION, docRef.id), {
          paymentId: order.id,
          updatedAt: Timestamp.now(),
        });
      } else if (paymentGateway === PaymentGateway.INTERNAL) {
        // Internal payment will be handled separately
        // No payment intent needed
      }
      
      return {
        donationId: docRef.id,
        clientSecret,
        paymentUrl,
        estimatedAmount: amountInUsdCents / 100, // Convert to dollars
        estimatedCost: estimate.formattedCost,
      };
    } catch (error) {
      console.error('Error creating donation intent:', error);
      throw error;
    }
  }
  
  /**
   * Process donation payment
   * @param donationId Donation ID
   * @param paymentId Payment ID from payment gateway
   * @returns Processed donation with offset details
   */
  async processDonationPayment(
    donationId: string,
    paymentId: string
  ): Promise<{
    donation: OffsetDonation;
    offset?: CarbonOffset;
  }> {
    try {
      // Get donation
      const donationRef = doc(firestore, this.DONATION_COLLECTION, donationId);
      const donationSnap = await getDoc(donationRef);
      
      if (!donationSnap.exists()) {
        throw new Error(`Donation with ID ${donationId} not found`);
      }
      
      const donation = donationSnap.data() as OffsetDonation & { id: string };
      donation.id = donationSnap.id;
      
      // Verify payment status based on gateway
      let paymentVerified = false;
      
      if (donation.paymentGateway === PaymentGateway.STRIPE) {
        // Verify Stripe payment
        const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentId);
        paymentVerified = paymentIntent.status === 'succeeded';
      } else if (donation.paymentGateway === PaymentGateway.PAYPAL) {
        // Verify PayPal payment
        const order = await this.paypalService.getOrder(paymentId);
        paymentVerified = order.status === 'COMPLETED';
      } else if (donation.paymentGateway === PaymentGateway.INTERNAL) {
        // Internal payment is assumed to be verified
        paymentVerified = true;
      }
      
      if (!paymentVerified) {
        // Update donation status to failed
        await updateDoc(donationRef, {
          status: OffsetPurchaseStatus.FAILED,
          updatedAt: Timestamp.now(),
        });
        
        donation.status = OffsetPurchaseStatus.FAILED;
        
        return { donation };
      }
      
      // Get offset estimate
      const estimate = await this.carbonTrackingService.estimateOffset(
        donation.carbonInKg,
        donation.projectType
      );
      
      // Purchase offset
      const offset = await this.carbonTrackingService.purchaseOffset(
        donation.userId,
        estimate.estimateId,
        donation.organizationId
      );
      
      // Update donation status to completed
      await updateDoc(donationRef, {
        status: OffsetPurchaseStatus.COMPLETED,
        offsetId: offset.id,
        updatedAt: Timestamp.now(),
      });
      
      donation.status = OffsetPurchaseStatus.COMPLETED;
      donation.offsetId = offset.id;
      
      return {
        donation,
        offset,
      };
    } catch (error) {
      console.error('Error processing donation payment:', error);
      throw error;
    }
  }
  
  /**
   * Process internal donation (using existing billing system)
   * @param donationId Donation ID
   * @param userId User ID
   * @returns Processed donation with offset details
   */
  async processInternalDonation(
    donationId: string,
    userId: string
  ): Promise<{
    donation: OffsetDonation;
    offset?: CarbonOffset;
  }> {
    try {
      // Get donation
      const donationRef = doc(firestore, this.DONATION_COLLECTION, donationId);
      const donationSnap = await getDoc(donationRef);
      
      if (!donationSnap.exists()) {
        throw new Error(`Donation with ID ${donationId} not found`);
      }
      
      const donation = donationSnap.data() as OffsetDonation & { id: string };
      donation.id = donationSnap.id;
      
      // Verify user ID
      if (donation.userId !== userId) {
        throw new Error('User ID does not match donation');
      }
      
      // Verify payment gateway
      if (donation.paymentGateway !== PaymentGateway.INTERNAL) {
        throw new Error('Donation is not set up for internal payment');
      }
      
      // Get offset estimate
      const estimate = await this.carbonTrackingService.estimateOffset(
        donation.carbonInKg,
        donation.projectType
      );
      
      // Purchase offset
      const offset = await this.carbonTrackingService.purchaseOffset(
        donation.userId,
        estimate.estimateId,
        donation.organizationId
      );
      
      // Update donation status to completed
      await updateDoc(donationRef, {
        status: OffsetPurchaseStatus.COMPLETED,
        offsetId: offset.id,
        updatedAt: Timestamp.now(),
      });
      
      donation.status = OffsetPurchaseStatus.COMPLETED;
      donation.offsetId = offset.id;
      
      return {
        donation,
        offset,
      };
    } catch (error) {
      console.error('Error processing internal donation:', error);
      throw error;
    }
  }
  
  /**
   * Get donation by ID
   * @param donationId Donation ID
   * @returns Donation details
   */
  async getDonation(donationId: string): Promise<OffsetDonation | null> {
    try {
      const donationRef = doc(firestore, this.DONATION_COLLECTION, donationId);
      const donationSnap = await getDoc(donationRef);
      
      if (!donationSnap.exists()) {
        return null;
      }
      
      const donation = donationSnap.data() as OffsetDonation;
      
      return {
        ...donation,
        id: donationSnap.id,
      };
    } catch (error) {
      console.error('Error getting donation:', error);
      throw error;
    }
  }
  
  /**
   * Calculate recommended offset amount based on usage
   * @param userId User ID
   * @param organizationId Optional organization ID
   * @returns Recommended offset amount in kg CO2e
   */
  async calculateRecommendedOffset(
    userId: string,
    organizationId?: string
  ): Promise<{
    recommendedCarbonInKg: number;
    estimatedCostInUsd: number;
    currentFootprint: {
      totalCarbonInKg: number;
      offsetCarbonInKg: number;
      remainingCarbonInKg: number;
      offsetPercentage: number;
    };
  }> {
    try {
      // Get carbon footprint summary
      const summary = await this.carbonTrackingService.getCarbonFootprintSummary(
        userId,
        organizationId
      );
      
      // Calculate recommended offset amount (remaining carbon)
      const recommendedCarbonInKg = summary.remainingCarbonInKg;
      
      // Estimate cost
      let estimatedCostInUsd = 0;
      
      if (recommendedCarbonInKg > 0) {
        const estimate = await this.carbonTrackingService.estimateOffset(recommendedCarbonInKg);
        estimatedCostInUsd = estimate.costInUsdCents / 100; // Convert to dollars
      }
      
      return {
        recommendedCarbonInKg,
        estimatedCostInUsd,
        currentFootprint: {
          totalCarbonInKg: summary.totalCarbonInKg,
          offsetCarbonInKg: summary.offsetCarbonInKg,
          remainingCarbonInKg: summary.remainingCarbonInKg,
          offsetPercentage: summary.offsetPercentage,
        },
      };
    } catch (error) {
      console.error('Error calculating recommended offset:', error);
      throw error;
    }
  }
}
