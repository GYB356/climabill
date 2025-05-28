import { firestore } from '../firebase/config';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentReference,
  DocumentData
} from 'firebase/firestore';
import { StripeService } from './stripe/stripe-service';
import { PayPalService } from './paypal/paypal-service';
import { SUBSCRIPTION_TIERS } from './stripe/config';
import { PAYPAL_SUBSCRIPTION_PLANS } from './paypal/config';

// Subscription provider enum
export enum SubscriptionProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

// Subscription status enum
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  TRIALING = 'trialing',
  PAUSED = 'paused',
  INCOMPLETE = 'incomplete',
  EXPIRED = 'expired',
}

// Subscription tier enum
export enum SubscriptionTier {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

// Subscription interface
export interface Subscription {
  id?: string;
  userId: string;
  customerId: string;
  provider: SubscriptionProvider;
  providerId: string; // ID from the provider (Stripe or PayPal)
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: Date | Timestamp;
  currentPeriodEnd: Date | Timestamp;
  cancelAtPeriodEnd: boolean;
  trialStart?: Date | Timestamp | null;
  trialEnd?: Date | Timestamp | null;
  canceledAt?: Date | Timestamp | null;
  endedAt?: Date | Timestamp | null;
  metadata?: Record<string, any>;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Service for managing subscriptions
 */
export class SubscriptionService {
  private static readonly COLLECTION = 'subscriptions';

  /**
   * Create a new subscription record
   * @param subscription Subscription data
   * @returns Created subscription with ID
   */
  static async createSubscription(
    subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Subscription> {
    try {
      const now = Timestamp.now();
      
      // Format dates as Firestore Timestamps
      const subscriptionData = {
        ...subscription,
        currentPeriodStart: subscription.currentPeriodStart instanceof Date 
          ? Timestamp.fromDate(subscription.currentPeriodStart) 
          : subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd instanceof Date 
          ? Timestamp.fromDate(subscription.currentPeriodEnd) 
          : subscription.currentPeriodEnd,
        trialStart: subscription.trialStart instanceof Date 
          ? Timestamp.fromDate(subscription.trialStart as Date) 
          : subscription.trialStart,
        trialEnd: subscription.trialEnd instanceof Date 
          ? Timestamp.fromDate(subscription.trialEnd as Date) 
          : subscription.trialEnd,
        canceledAt: subscription.canceledAt instanceof Date 
          ? Timestamp.fromDate(subscription.canceledAt as Date) 
          : subscription.canceledAt,
        endedAt: subscription.endedAt instanceof Date 
          ? Timestamp.fromDate(subscription.endedAt as Date) 
          : subscription.endedAt,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(firestore, this.COLLECTION), subscriptionData);
      
      return {
        ...subscriptionData,
        id: docRef.id,
      } as Subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Update an existing subscription
   * @param id Subscription ID
   * @param subscription Subscription data to update
   * @returns Updated subscription
   */
  static async updateSubscription(
    id: string, 
    subscription: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Subscription> {
    try {
      const now = Timestamp.now();
      
      // Format dates as Firestore Timestamps if they exist
      const subscriptionData: Partial<Subscription> = {
        ...subscription,
        updatedAt: now,
      };
      
      if (subscription.currentPeriodStart) {
        subscriptionData.currentPeriodStart = subscription.currentPeriodStart instanceof Date 
          ? Timestamp.fromDate(subscription.currentPeriodStart) 
          : subscription.currentPeriodStart;
      }
      
      if (subscription.currentPeriodEnd) {
        subscriptionData.currentPeriodEnd = subscription.currentPeriodEnd instanceof Date 
          ? Timestamp.fromDate(subscription.currentPeriodEnd) 
          : subscription.currentPeriodEnd;
      }
      
      if (subscription.trialStart) {
        subscriptionData.trialStart = subscription.trialStart instanceof Date 
          ? Timestamp.fromDate(subscription.trialStart) 
          : subscription.trialStart;
      }
      
      if (subscription.trialEnd) {
        subscriptionData.trialEnd = subscription.trialEnd instanceof Date 
          ? Timestamp.fromDate(subscription.trialEnd) 
          : subscription.trialEnd;
      }
      
      if (subscription.canceledAt) {
        subscriptionData.canceledAt = subscription.canceledAt instanceof Date 
          ? Timestamp.fromDate(subscription.canceledAt) 
          : subscription.canceledAt;
      }
      
      if (subscription.endedAt) {
        subscriptionData.endedAt = subscription.endedAt instanceof Date 
          ? Timestamp.fromDate(subscription.endedAt) 
          : subscription.endedAt;
      }
      
      const docRef = doc(firestore, this.COLLECTION, id);
      await updateDoc(docRef, subscriptionData);
      
      // Get the updated document
      const updatedDoc = await getDoc(docRef);
      
      if (!updatedDoc.exists()) {
        throw new Error(`Subscription with ID ${id} not found`);
      }
      
      return {
        ...updatedDoc.data(),
        id: updatedDoc.id,
      } as Subscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Get a subscription by ID
   * @param id Subscription ID
   * @returns Subscription data
   */
  static async getSubscription(id: string): Promise<Subscription | null> {
    try {
      const docRef = doc(firestore, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return {
        ...docSnap.data(),
        id: docSnap.id,
      } as Subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw error;
    }
  }

  /**
   * Get a user's active subscription
   * @param userId User ID
   * @returns Active subscription or null
   */
  static async getUserActiveSubscription(userId: string): Promise<Subscription | null> {
    try {
      const q = query(
        collection(firestore, this.COLLECTION),
        where('userId', '==', userId),
        where('status', 'in', [
          SubscriptionStatus.ACTIVE, 
          SubscriptionStatus.TRIALING,
          SubscriptionStatus.PAST_DUE
        ]),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      
      return {
        ...doc.data(),
        id: doc.id,
      } as Subscription;
    } catch (error) {
      console.error('Error getting user active subscription:', error);
      throw error;
    }
  }

  /**
   * Get all subscriptions for a user
   * @param userId User ID
   * @returns List of subscriptions
   */
  static async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      const q = query(
        collection(firestore, this.COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Subscription[];
    } catch (error) {
      console.error('Error getting user subscriptions:', error);
      throw error;
    }
  }

  /**
   * Create a Stripe checkout session for subscription
   * @param userId User ID
   * @param customerId Stripe customer ID
   * @param tier Subscription tier
   * @param trialDays Optional trial period in days
   * @returns Checkout session URL
   */
  static async createStripeCheckoutSession(
    userId: string,
    customerId: string,
    tier: SubscriptionTier,
    trialDays?: number
  ): Promise<string> {
    try {
      // Get the price ID for the selected tier
      let priceId = '';
      
      switch (tier) {
        case SubscriptionTier.BASIC:
          priceId = SUBSCRIPTION_TIERS.BASIC.priceId as string;
          break;
        case SubscriptionTier.PROFESSIONAL:
          priceId = SUBSCRIPTION_TIERS.PROFESSIONAL.priceId as string;
          break;
        case SubscriptionTier.ENTERPRISE:
          priceId = SUBSCRIPTION_TIERS.ENTERPRISE.priceId as string;
          break;
        default:
          throw new Error(`Invalid subscription tier: ${tier}`);
      }
      
      // Create the checkout session
      const session = await StripeService.createSubscriptionCheckoutSession(
        customerId,
        priceId,
        trialDays
      );
      
      return session.url as string;
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      throw error;
    }
  }

  /**
   * Create a PayPal subscription
   * @param userId User ID
   * @param customerId Customer ID in your system
   * @param tier Subscription tier
   * @returns PayPal subscription approval URL
   */
  static async createPayPalSubscription(
    userId: string,
    customerId: string,
    tier: SubscriptionTier
  ): Promise<string> {
    try {
      // Get the plan ID for the selected tier
      let planId = '';
      
      switch (tier) {
        case SubscriptionTier.BASIC:
          planId = PAYPAL_SUBSCRIPTION_PLANS.BASIC;
          break;
        case SubscriptionTier.PROFESSIONAL:
          planId = PAYPAL_SUBSCRIPTION_PLANS.PROFESSIONAL;
          break;
        case SubscriptionTier.ENTERPRISE:
          planId = PAYPAL_SUBSCRIPTION_PLANS.ENTERPRISE;
          break;
        default:
          throw new Error(`Invalid subscription tier: ${tier}`);
      }
      
      // Create the PayPal subscription
      const subscription = await PayPalService.createSubscription(
        planId,
        customerId
      );
      
      // Find the approval URL in the links array
      const approvalLink = subscription.links.find(
        (link: any) => link.rel === 'approve'
      );
      
      if (!approvalLink) {
        throw new Error('PayPal approval URL not found');
      }
      
      return approvalLink.href;
    } catch (error) {
      console.error('Error creating PayPal subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   * @param id Subscription ID
   * @param immediately Whether to cancel immediately or at period end
   * @returns Updated subscription
   */
  static async cancelSubscription(
    id: string,
    immediately = false
  ): Promise<Subscription> {
    try {
      // Get the subscription
      const subscription = await this.getSubscription(id);
      
      if (!subscription) {
        throw new Error(`Subscription with ID ${id} not found`);
      }
      
      const now = new Date();
      
      // Cancel with the provider
      if (subscription.provider === SubscriptionProvider.STRIPE) {
        await StripeService.cancelSubscription(
          subscription.providerId,
          immediately
        );
      } else if (subscription.provider === SubscriptionProvider.PAYPAL) {
        await PayPalService.cancelSubscription(
          subscription.providerId,
          'Canceled by customer'
        );
      }
      
      // Update the subscription in the database
      const updateData: Partial<Subscription> = {
        status: immediately 
          ? SubscriptionStatus.CANCELED 
          : SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: !immediately,
        canceledAt: Timestamp.fromDate(now),
      };
      
      if (immediately) {
        updateData.endedAt = Timestamp.fromDate(now);
      }
      
      return this.updateSubscription(id, updateData);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Upgrade or downgrade a subscription
   * @param id Subscription ID
   * @param newTier New subscription tier
   * @returns Updated subscription
   */
  static async changeSubscriptionTier(
    id: string,
    newTier: SubscriptionTier
  ): Promise<Subscription> {
    try {
      // Get the subscription
      const subscription = await this.getSubscription(id);
      
      if (!subscription) {
        throw new Error(`Subscription with ID ${id} not found`);
      }
      
      // Get the price/plan ID for the new tier
      let stripePriceId = '';
      let paypalPlanId = '';
      
      switch (newTier) {
        case SubscriptionTier.BASIC:
          stripePriceId = SUBSCRIPTION_TIERS.BASIC.priceId as string;
          paypalPlanId = PAYPAL_SUBSCRIPTION_PLANS.BASIC;
          break;
        case SubscriptionTier.PROFESSIONAL:
          stripePriceId = SUBSCRIPTION_TIERS.PROFESSIONAL.priceId as string;
          paypalPlanId = PAYPAL_SUBSCRIPTION_PLANS.PROFESSIONAL;
          break;
        case SubscriptionTier.ENTERPRISE:
          stripePriceId = SUBSCRIPTION_TIERS.ENTERPRISE.priceId as string;
          paypalPlanId = PAYPAL_SUBSCRIPTION_PLANS.ENTERPRISE;
          break;
        default:
          throw new Error(`Invalid subscription tier: ${newTier}`);
      }
      
      // Update with the provider
      if (subscription.provider === SubscriptionProvider.STRIPE) {
        await StripeService.updateSubscription(
          subscription.providerId,
          stripePriceId
        );
      } else if (subscription.provider === SubscriptionProvider.PAYPAL) {
        await PayPalService.updateSubscription(
          subscription.providerId,
          paypalPlanId
        );
      }
      
      // Update the subscription in the database
      return this.updateSubscription(id, {
        tier: newTier,
      });
    } catch (error) {
      console.error('Error changing subscription tier:', error);
      throw error;
    }
  }

  /**
   * Process a subscription webhook event
   * @param provider Subscription provider
   * @param event Webhook event data
   * @returns Updated subscription if applicable
   */
  static async processWebhookEvent(
    provider: SubscriptionProvider,
    event: any
  ): Promise<Subscription | null> {
    try {
      if (provider === SubscriptionProvider.STRIPE) {
        return this.processStripeWebhookEvent(event);
      } else if (provider === SubscriptionProvider.PAYPAL) {
        return this.processPayPalWebhookEvent(event);
      }
      
      return null;
    } catch (error) {
      console.error('Error processing webhook event:', error);
      throw error;
    }
  }

  /**
   * Process a Stripe webhook event
   * @param event Stripe webhook event
   * @returns Updated subscription if applicable
   */
  private static async processStripeWebhookEvent(event: any): Promise<Subscription | null> {
    const eventType = event.type;
    const data = event.data.object;
    
    // Find the subscription in our database
    const q = query(
      collection(firestore, this.COLLECTION),
      where('provider', '==', SubscriptionProvider.STRIPE),
      where('providerId', '==', data.id),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Subscription not found in our database
      // This could be a new subscription that we need to create
      if (eventType === 'customer.subscription.created') {
        // TODO: Create a new subscription record
        // This would require additional information like userId
        // which might not be available in the webhook event
        return null;
      }
      
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const subscription = {
      ...doc.data(),
      id: doc.id,
    } as Subscription;
    
    // Process the event based on its type
    switch (eventType) {
      case 'customer.subscription.updated':
        // Map Stripe status to our status
        let status: SubscriptionStatus;
        
        switch (data.status) {
          case 'active':
            status = SubscriptionStatus.ACTIVE;
            break;
          case 'canceled':
            status = SubscriptionStatus.CANCELED;
            break;
          case 'past_due':
            status = SubscriptionStatus.PAST_DUE;
            break;
          case 'unpaid':
            status = SubscriptionStatus.UNPAID;
            break;
          case 'trialing':
            status = SubscriptionStatus.TRIALING;
            break;
          case 'incomplete':
            status = SubscriptionStatus.INCOMPLETE;
            break;
          default:
            status = SubscriptionStatus.ACTIVE;
        }
        
        // Update the subscription
        return this.updateSubscription(subscription.id as string, {
          status,
          currentPeriodStart: new Date(data.current_period_start * 1000),
          currentPeriodEnd: new Date(data.current_period_end * 1000),
          cancelAtPeriodEnd: data.cancel_at_period_end,
          trialStart: data.trial_start ? new Date(data.trial_start * 1000) : null,
          trialEnd: data.trial_end ? new Date(data.trial_end * 1000) : null,
        });
        
      case 'customer.subscription.deleted':
        // Update the subscription as canceled
        return this.updateSubscription(subscription.id as string, {
          status: SubscriptionStatus.CANCELED,
          canceledAt: new Date(),
          endedAt: new Date(),
        });
        
      default:
        return null;
    }
  }

  /**
   * Process a PayPal webhook event
   * @param event PayPal webhook event
   * @returns Updated subscription if applicable
   */
  private static async processPayPalWebhookEvent(event: any): Promise<Subscription | null> {
    const eventType = event.event_type;
    const resource = event.resource;
    
    // Find the subscription in our database
    const q = query(
      collection(firestore, this.COLLECTION),
      where('provider', '==', SubscriptionProvider.PAYPAL),
      where('providerId', '==', resource.id),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Subscription not found in our database
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const subscription = {
      ...doc.data(),
      id: doc.id,
    } as Subscription;
    
    // Process the event based on its type
    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        // Update the subscription with the latest details
        return this.updateSubscription(subscription.id as string, {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: new Date(resource.start_time),
          currentPeriodEnd: new Date(resource.billing_info.next_billing_time),
        });
        
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        return this.updateSubscription(subscription.id as string, {
          status: SubscriptionStatus.ACTIVE,
        });
        
      case 'BILLING.SUBSCRIPTION.UPDATED':
        return this.updateSubscription(subscription.id as string, {
          currentPeriodEnd: new Date(resource.billing_info.next_billing_time),
        });
        
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        return this.updateSubscription(subscription.id as string, {
          status: SubscriptionStatus.PAUSED,
        });
        
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        return this.updateSubscription(subscription.id as string, {
          status: SubscriptionStatus.CANCELED,
          canceledAt: new Date(),
          endedAt: new Date(resource.status_update_time),
        });
        
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        return this.updateSubscription(subscription.id as string, {
          status: SubscriptionStatus.EXPIRED,
          endedAt: new Date(resource.status_update_time),
        });
        
      case 'PAYMENT.SALE.COMPLETED':
        // Payment was successful, ensure subscription is active
        return this.updateSubscription(subscription.id as string, {
          status: SubscriptionStatus.ACTIVE,
        });
        
      case 'PAYMENT.SALE.DENIED':
      case 'PAYMENT.SALE.REFUNDED':
      case 'PAYMENT.SALE.REVERSED':
        // Payment issue, mark as past due
        return this.updateSubscription(subscription.id as string, {
          status: SubscriptionStatus.PAST_DUE,
        });
        
      default:
        return null;
    }
  }

  /**
   * Get subscriptions that need dunning (payment retry)
   * @param limitCount Maximum number of subscriptions to return
   * @returns List of past due subscriptions
   */
  static async getSubscriptionsForDunning(limitCount = 100): Promise<Subscription[]> {
    try {
      const q = query(
        collection(firestore, this.COLLECTION),
        where('status', '==', SubscriptionStatus.PAST_DUE),
        orderBy('updatedAt', 'asc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Subscription[];
    } catch (error) {
      console.error('Error getting subscriptions for dunning:', error);
      throw error;
    }
  }
}
