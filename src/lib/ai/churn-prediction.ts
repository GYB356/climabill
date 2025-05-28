import { SageMakerClient } from './sagemaker-client';
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
  Timestamp 
} from 'firebase/firestore';
import { FEATURE_IMPORTANCE_THRESHOLD } from './config';

// Interface for customer data used in churn prediction
export interface CustomerChurnData {
  customerId: string;
  subscriptionTier?: string;
  subscriptionLengthMonths: number;
  paymentDelays: number;
  supportTicketsCount: number;
  averageResponseTime?: number;
  loginFrequencyPerMonth: number;
  featureUsagePercent: number;
  invoiceCount: number;
  revenueLastThreeMonths: number;
}

// Interface for churn prediction result
export interface ChurnPrediction {
  id?: string;
  customerId: string;
  willChurn: boolean;
  probability: number;
  confidence: 'high' | 'medium' | 'low';
  topFactors: Array<{
    feature: string;
    importance: number;
    direction: 'positive' | 'negative';
  }>;
  recommendedActions?: string[];
  createdAt: Date | Timestamp;
}

/**
 * Service for customer churn prediction
 */
export class ChurnPredictionService {
  private sageMakerClient: SageMakerClient;
  private readonly COLLECTION = 'churnPredictions';
  
  constructor() {
    this.sageMakerClient = new SageMakerClient();
  }
  
  /**
   * Prepare customer data for churn prediction
   * @param customerId Customer ID
   * @returns Prepared customer data
   */
  private async prepareCustomerData(customerId: string): Promise<CustomerChurnData> {
    try {
      // Get customer subscription data
      const subscriptionsRef = collection(firestore, 'subscriptions');
      const subscriptionQuery = query(
        subscriptionsRef,
        where('userId', '==', customerId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const subscriptionSnapshot = await getDocs(subscriptionQuery);
      
      let subscriptionTier = '';
      let subscriptionLengthMonths = 0;
      
      if (!subscriptionSnapshot.empty) {
        const subscription = subscriptionSnapshot.docs[0].data();
        subscriptionTier = subscription.tier;
        
        // Calculate subscription length in months
        const startDate = subscription.createdAt.toDate();
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - startDate.getTime());
        subscriptionLengthMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      }
      
      // Get invoice data
      const invoicesRef = collection(firestore, 'invoices');
      const invoiceQuery = query(
        invoicesRef,
        where('customerId', '==', customerId)
      );
      const invoiceSnapshot = await getDocs(invoiceQuery);
      
      const invoices = invoiceSnapshot.docs.map(doc => doc.data());
      const invoiceCount = invoices.length;
      
      // Count payment delays
      const paymentDelays = invoices.filter(invoice => 
        invoice.status === 'overdue' || 
        (invoice.status === 'paid' && invoice.paidDate && 
         invoice.dueDate && invoice.paidDate.toDate() > invoice.dueDate.toDate())
      ).length;
      
      // Calculate revenue from last three months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const recentInvoices = invoices.filter(invoice => 
        invoice.status === 'paid' && 
        invoice.paidDate && 
        invoice.paidDate.toDate() >= threeMonthsAgo
      );
      
      const revenueLastThreeMonths = recentInvoices.reduce(
        (sum, invoice) => sum + (invoice.total || 0), 
        0
      );
      
      // Get support ticket data
      const ticketsRef = collection(firestore, 'supportTickets');
      const ticketQuery = query(
        ticketsRef,
        where('customerId', '==', customerId)
      );
      const ticketSnapshot = await getDocs(ticketQuery);
      
      const supportTicketsCount = ticketSnapshot.size;
      
      // Calculate average response time for support tickets
      let totalResponseTime = 0;
      let respondedTickets = 0;
      
      ticketSnapshot.forEach(doc => {
        const ticket = doc.data();
        if (ticket.createdAt && ticket.firstResponseAt) {
          const createdTime = ticket.createdAt.toDate().getTime();
          const responseTime = ticket.firstResponseAt.toDate().getTime();
          totalResponseTime += (responseTime - createdTime) / (1000 * 60 * 60); // hours
          respondedTickets++;
        }
      });
      
      const averageResponseTime = respondedTickets > 0 
        ? totalResponseTime / respondedTickets 
        : undefined;
      
      // Get user activity data (simplified example)
      // In a real implementation, this would come from an analytics database
      const userActivityRef = collection(firestore, 'userActivity');
      const activityQuery = query(
        userActivityRef,
        where('userId', '==', customerId),
        orderBy('timestamp', 'desc'),
        limit(30) // Last 30 days
      );
      const activitySnapshot = await getDocs(activityQuery);
      
      const loginFrequencyPerMonth = activitySnapshot.size;
      
      // Calculate feature usage percentage (simplified)
      // In a real implementation, this would be more sophisticated
      const featureUsagePercent = Math.min(
        100,
        Math.round(loginFrequencyPerMonth * 3.33) // Simplified calculation
      );
      
      return {
        customerId,
        subscriptionTier,
        subscriptionLengthMonths,
        paymentDelays,
        supportTicketsCount,
        averageResponseTime,
        loginFrequencyPerMonth,
        featureUsagePercent,
        invoiceCount,
        revenueLastThreeMonths
      };
    } catch (error) {
      console.error('Error preparing customer data:', error);
      throw error;
    }
  }
  
  /**
   * Predict churn for a specific customer
   * @param customerId Customer ID
   * @returns Churn prediction result
   */
  async predictChurnForCustomer(customerId: string): Promise<ChurnPrediction> {
    try {
      // Prepare customer data
      const customerData = await this.prepareCustomerData(customerId);
      
      // Get churn prediction
      const churnPrediction = await this.sageMakerClient.predictChurn(customerData);
      
      // Get feature importance
      const featureImportance = await this.sageMakerClient.getFeatureImportance(
        'churn-prediction',
        customerData
      );
      
      // Process feature importance to get top factors
      const topFactors = Object.entries(featureImportance)
        .filter(([_, importance]) => Math.abs(importance) >= FEATURE_IMPORTANCE_THRESHOLD)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
        .slice(0, 5)
        .map(([feature, importance]) => ({
          feature: this.formatFeatureName(feature),
          importance: Math.abs(importance),
          direction: importance > 0 ? 'positive' : 'negative'
        }));
      
      // Generate recommended actions based on top factors
      const recommendedActions = this.generateRecommendedActions(
        topFactors,
        churnPrediction.willChurn
      );
      
      // Create prediction record
      const prediction: ChurnPrediction = {
        customerId,
        willChurn: churnPrediction.willChurn,
        probability: churnPrediction.probability,
        confidence: churnPrediction.confidence,
        topFactors,
        recommendedActions,
        createdAt: Timestamp.now()
      };
      
      // Save prediction to Firestore
      const docRef = await addDoc(collection(firestore, this.COLLECTION), prediction);
      
      return {
        ...prediction,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error predicting churn:', error);
      throw error;
    }
  }
  
  /**
   * Get the latest churn prediction for a customer
   * @param customerId Customer ID
   * @returns Latest churn prediction or null if none exists
   */
  async getLatestChurnPrediction(customerId: string): Promise<ChurnPrediction | null> {
    try {
      const predictionsRef = collection(firestore, this.COLLECTION);
      const predictionQuery = query(
        predictionsRef,
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const predictionSnapshot = await getDocs(predictionQuery);
      
      if (predictionSnapshot.empty) {
        return null;
      }
      
      const doc = predictionSnapshot.docs[0];
      
      return {
        ...doc.data(),
        id: doc.id
      } as ChurnPrediction;
    } catch (error) {
      console.error('Error getting latest churn prediction:', error);
      throw error;
    }
  }
  
  /**
   * Get all customers with high churn risk
   * @param limit Maximum number of customers to return
   * @returns List of high-risk customers with their predictions
   */
  async getHighRiskCustomers(limit = 10): Promise<ChurnPrediction[]> {
    try {
      // Get the latest prediction for each customer
      const customersRef = collection(firestore, 'users');
      const customerSnapshot = await getDocs(customersRef);
      
      const predictions: ChurnPrediction[] = [];
      
      for (const customerDoc of customerSnapshot.docs) {
        const customerId = customerDoc.id;
        const prediction = await this.getLatestChurnPrediction(customerId);
        
        if (prediction && prediction.willChurn && prediction.confidence !== 'low') {
          predictions.push(prediction);
        }
        
        if (predictions.length >= limit) {
          break;
        }
      }
      
      // Sort by probability (highest first)
      return predictions.sort((a, b) => b.probability - a.probability);
    } catch (error) {
      console.error('Error getting high risk customers:', error);
      throw error;
    }
  }
  
  /**
   * Format feature name for display
   * @param feature Raw feature name
   * @returns Formatted feature name
   */
  private formatFeatureName(feature: string): string {
    // Convert snake_case or camelCase to Title Case with spaces
    return feature
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^\w/, c => c.toUpperCase())
      .trim();
  }
  
  /**
   * Generate recommended actions based on top factors
   * @param topFactors Top factors affecting churn
   * @param willChurn Whether the customer is predicted to churn
   * @returns List of recommended actions
   */
  private generateRecommendedActions(
    topFactors: Array<{
      feature: string;
      importance: number;
      direction: 'positive' | 'negative';
    }>,
    willChurn: boolean
  ): string[] {
    const actions: string[] = [];
    
    if (willChurn) {
      // Generate actions for customers likely to churn
      for (const factor of topFactors) {
        if (factor.direction === 'positive') {
          // This factor increases churn risk
          switch (factor.feature.toLowerCase()) {
            case 'payment delays':
              actions.push('Offer a more flexible payment schedule');
              break;
            case 'support tickets count':
              actions.push('Proactively reach out to address ongoing issues');
              break;
            case 'average response time':
              actions.push('Prioritize support tickets from this customer');
              break;
            case 'login frequency per month':
              if (factor.importance > 0) {
                actions.push('Send re-engagement email with new feature highlights');
              }
              break;
            case 'feature usage percent':
              actions.push('Schedule a product training session');
              break;
            case 'subscription length months':
              if (factor.importance > 0) {
                actions.push('Offer loyalty discount or premium features');
              }
              break;
            default:
              // Generic action for other factors
              actions.push(`Address issues with ${factor.feature.toLowerCase()}`);
          }
        }
      }
      
      // Add general retention actions
      actions.push('Schedule a customer success check-in call');
      
      if (actions.length < 3) {
        actions.push('Offer a temporary discount on renewal');
      }
    } else {
      // Generate actions for customers not likely to churn
      // Focus on upselling and expansion
      actions.push('Consider for upselling to higher tier');
      actions.push('Ask for referrals or testimonials');
      
      // Look at positive factors to reinforce
      for (const factor of topFactors) {
        if (factor.direction === 'negative') {
          // This factor decreases churn risk
          switch (factor.feature.toLowerCase()) {
            case 'feature usage percent':
              actions.push('Highlight additional advanced features they might benefit from');
              break;
            case 'login frequency per month':
              actions.push('Invite to beta testing program for new features');
              break;
            case 'subscription length months':
              actions.push('Offer annual subscription discount');
              break;
            default:
              // No specific action needed
              break;
          }
        }
      }
    }
    
    // Return unique actions
    return [...new Set(actions)];
  }
}
