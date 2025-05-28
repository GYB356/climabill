import { DataWarehouseClient } from './data-warehouse';
import { ANALYTICS_REFRESH_INTERVALS } from '../ai/config';
import { firestore } from '../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';

// Time periods for analytics
export enum TimePeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

// Interface for revenue metrics
export interface RevenueMetrics {
  totalRevenue: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
  averageRevenuePerCustomer: number;
  revenueByPlan: Record<string, number>;
  growthRate: number;
}

// Interface for customer metrics
export interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  churnRate: number;
  customersByPlan: Record<string, number>;
  customersByStatus: Record<string, number>;
}

// Interface for invoice metrics
export interface InvoiceMetrics {
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  averageInvoiceValue: number;
  invoicesByStatus: Record<string, number>;
}

// Interface for dashboard metrics
export interface DashboardMetrics {
  revenue: RevenueMetrics;
  customers: CustomerMetrics;
  invoices: InvoiceMetrics;
  lastUpdated: Date;
}

/**
 * Service for analytics data processing
 */
export class AnalyticsService {
  private dataWarehouse: DataWarehouseClient;
  
  constructor() {
    this.dataWarehouse = DataWarehouseClient.getInstance();
  }
  
  /**
   * Get dashboard metrics for the specified time period
   * @param period Time period for metrics
   * @returns Dashboard metrics
   */
  async getDashboardMetrics(period: TimePeriod = TimePeriod.MONTH): Promise<DashboardMetrics> {
    try {
      // Get start date based on period
      const startDate = this.getStartDateForPeriod(period);
      
      // Get metrics in parallel
      const [revenue, customers, invoices] = await Promise.all([
        this.getRevenueMetrics(startDate),
        this.getCustomerMetrics(startDate),
        this.getInvoiceMetrics(startDate),
      ]);
      
      return {
        revenue,
        customers,
        invoices,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }
  
  /**
   * Get revenue metrics for the specified time period
   * @param startDate Start date for metrics
   * @returns Revenue metrics
   */
  private async getRevenueMetrics(startDate: Date): Promise<RevenueMetrics> {
    try {
      // For demonstration, we'll use Firestore directly
      // In a production environment, this would query the data warehouse
      const invoicesRef = collection(firestore, 'invoices');
      const invoiceQuery = query(
        invoicesRef,
        where('status', '==', 'paid'),
        where('paidDate', '>=', Timestamp.fromDate(startDate))
      );
      
      const invoiceSnapshot = await getDocs(invoiceQuery);
      const invoices = invoiceSnapshot.docs.map(doc => doc.data());
      
      // Calculate total revenue
      const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
      
      // Get subscriptions to calculate recurring revenue
      const subscriptionsRef = collection(firestore, 'subscriptions');
      const subscriptionQuery = query(
        subscriptionsRef,
        where('status', '==', 'active')
      );
      
      const subscriptionSnapshot = await getDocs(subscriptionQuery);
      const subscriptions = subscriptionSnapshot.docs.map(doc => doc.data());
      
      // Calculate revenue by plan
      const revenueByPlan: Record<string, number> = {};
      
      // Group invoices by subscription plan
      for (const invoice of invoices) {
        if (invoice.metadata && invoice.metadata.subscriptionTier) {
          const tier = invoice.metadata.subscriptionTier;
          revenueByPlan[tier] = (revenueByPlan[tier] || 0) + (invoice.total || 0);
        }
      }
      
      // Calculate recurring vs one-time revenue
      // For simplicity, we'll consider subscription invoices as recurring
      const recurringRevenue = invoices
        .filter(invoice => invoice.metadata && invoice.metadata.subscriptionId)
        .reduce((sum, invoice) => sum + (invoice.total || 0), 0);
      
      const oneTimeRevenue = totalRevenue - recurringRevenue;
      
      // Calculate average revenue per customer
      const customerIds = new Set(invoices.map(invoice => invoice.customerId));
      const averageRevenuePerCustomer = customerIds.size > 0 
        ? totalRevenue / customerIds.size 
        : 0;
      
      // Calculate growth rate (simplified)
      // In a real implementation, we would compare to previous period
      const growthRate = 0.05; // 5% growth (placeholder)
      
      return {
        totalRevenue,
        recurringRevenue,
        oneTimeRevenue,
        averageRevenuePerCustomer,
        revenueByPlan,
        growthRate,
      };
    } catch (error) {
      console.error('Error getting revenue metrics:', error);
      throw error;
    }
  }
  
  /**
   * Get customer metrics for the specified time period
   * @param startDate Start date for metrics
   * @returns Customer metrics
   */
  private async getCustomerMetrics(startDate: Date): Promise<CustomerMetrics> {
    try {
      // Get all users
      const usersRef = collection(firestore, 'users');
      const userSnapshot = await getDocs(usersRef);
      const users = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const totalCustomers = users.length;
      
      // Get new customers in the period
      const newCustomers = users.filter(user => 
        user.createdAt && user.createdAt.toDate() >= startDate
      ).length;
      
      // Get active subscriptions
      const subscriptionsRef = collection(firestore, 'subscriptions');
      const activeSubQuery = query(
        subscriptionsRef,
        where('status', '==', 'active')
      );
      
      const activeSubSnapshot = await getDocs(activeSubQuery);
      const activeSubscriptions = activeSubSnapshot.docs.map(doc => doc.data());
      
      // Count active customers (those with active subscriptions)
      const activeCustomerIds = new Set(activeSubscriptions.map(sub => sub.userId));
      const activeCustomers = activeCustomerIds.size;
      
      // Calculate churn rate
      // For simplicity, we'll use a basic calculation
      // In a real implementation, this would be more sophisticated
      const canceledSubQuery = query(
        subscriptionsRef,
        where('canceledAt', '>=', Timestamp.fromDate(startDate))
      );
      
      const canceledSubSnapshot = await getDocs(canceledSubQuery);
      const canceledSubscriptions = canceledSubSnapshot.docs.map(doc => doc.data());
      
      // Basic churn rate calculation
      const churnRate = activeCustomers > 0 
        ? canceledSubscriptions.length / activeCustomers 
        : 0;
      
      // Count customers by plan
      const customersByPlan: Record<string, number> = {};
      
      for (const sub of activeSubscriptions) {
        const tier = sub.tier;
        customersByPlan[tier] = (customersByPlan[tier] || 0) + 1;
      }
      
      // Count customers by status
      const customersByStatus: Record<string, number> = {
        active: activeCustomers,
        inactive: totalCustomers - activeCustomers,
        new: newCustomers,
      };
      
      return {
        totalCustomers,
        activeCustomers,
        newCustomers,
        churnRate,
        customersByPlan,
        customersByStatus,
      };
    } catch (error) {
      console.error('Error getting customer metrics:', error);
      throw error;
    }
  }
  
  /**
   * Get invoice metrics for the specified time period
   * @param startDate Start date for metrics
   * @returns Invoice metrics
   */
  private async getInvoiceMetrics(startDate: Date): Promise<InvoiceMetrics> {
    try {
      // Get all invoices in the period
      const invoicesRef = collection(firestore, 'invoices');
      const invoiceQuery = query(
        invoicesRef,
        where('issueDate', '>=', Timestamp.fromDate(startDate))
      );
      
      const invoiceSnapshot = await getDocs(invoiceQuery);
      const invoices = invoiceSnapshot.docs.map(doc => doc.data());
      
      const totalInvoices = invoices.length;
      
      // Count invoices by status
      const invoicesByStatus: Record<string, number> = {};
      
      for (const invoice of invoices) {
        const status = invoice.status;
        invoicesByStatus[status] = (invoicesByStatus[status] || 0) + 1;
      }
      
      // Get paid and overdue counts
      const paidInvoices = invoicesByStatus['paid'] || 0;
      const overdueInvoices = invoicesByStatus['overdue'] || 0;
      
      // Calculate average invoice value
      const totalValue = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
      const averageInvoiceValue = totalInvoices > 0 ? totalValue / totalInvoices : 0;
      
      return {
        totalInvoices,
        paidInvoices,
        overdueInvoices,
        averageInvoiceValue,
        invoicesByStatus,
      };
    } catch (error) {
      console.error('Error getting invoice metrics:', error);
      throw error;
    }
  }
  
  /**
   * Get revenue time series data for charts
   * @param period Time period for metrics
   * @param dataPoints Number of data points to return
   * @returns Revenue time series data
   */
  async getRevenueTimeSeries(
    period: TimePeriod = TimePeriod.MONTH,
    dataPoints = 12
  ): Promise<Array<{ date: string; revenue: number }>> {
    try {
      // Calculate interval based on period
      const interval = this.getIntervalForPeriod(period);
      
      // In a production environment, this would be a SQL query to the data warehouse
      // For demonstration, we'll generate sample data
      const result: Array<{ date: string; revenue: number }> = [];
      
      const now = new Date();
      for (let i = dataPoints - 1; i >= 0; i--) {
        const date = new Date(now);
        
        switch (period) {
          case TimePeriod.DAY:
            date.setDate(date.getDate() - i);
            break;
          case TimePeriod.WEEK:
            date.setDate(date.getDate() - (i * 7));
            break;
          case TimePeriod.MONTH:
            date.setMonth(date.getMonth() - i);
            break;
          case TimePeriod.QUARTER:
            date.setMonth(date.getMonth() - (i * 3));
            break;
          case TimePeriod.YEAR:
            date.setFullYear(date.getFullYear() - i);
            break;
        }
        
        // Format date based on period
        let formattedDate: string;
        
        switch (period) {
          case TimePeriod.DAY:
            formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
            break;
          case TimePeriod.WEEK:
            formattedDate = `Week ${this.getWeekNumber(date)}, ${date.getFullYear()}`;
            break;
          case TimePeriod.MONTH:
            formattedDate = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            break;
          case TimePeriod.QUARTER:
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            formattedDate = `Q${quarter} ${date.getFullYear()}`;
            break;
          case TimePeriod.YEAR:
            formattedDate = date.getFullYear().toString();
            break;
          default:
            formattedDate = date.toISOString().split('T')[0];
        }
        
        // For demonstration, we'll generate random revenue data
        // In a real implementation, this would come from the data warehouse
        const revenue = 10000 + Math.random() * 5000;
        
        result.push({
          date: formattedDate,
          revenue: Math.round(revenue),
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error getting revenue time series:', error);
      throw error;
    }
  }
  
  /**
   * Get customer growth time series data for charts
   * @param period Time period for metrics
   * @param dataPoints Number of data points to return
   * @returns Customer growth time series data
   */
  async getCustomerGrowthTimeSeries(
    period: TimePeriod = TimePeriod.MONTH,
    dataPoints = 12
  ): Promise<Array<{ date: string; newCustomers: number; churnedCustomers: number; netGrowth: number }>> {
    try {
      // In a production environment, this would be a SQL query to the data warehouse
      // For demonstration, we'll generate sample data
      const result: Array<{ 
        date: string; 
        newCustomers: number; 
        churnedCustomers: number; 
        netGrowth: number 
      }> = [];
      
      const now = new Date();
      for (let i = dataPoints - 1; i >= 0; i--) {
        const date = new Date(now);
        
        switch (period) {
          case TimePeriod.DAY:
            date.setDate(date.getDate() - i);
            break;
          case TimePeriod.WEEK:
            date.setDate(date.getDate() - (i * 7));
            break;
          case TimePeriod.MONTH:
            date.setMonth(date.getMonth() - i);
            break;
          case TimePeriod.QUARTER:
            date.setMonth(date.getMonth() - (i * 3));
            break;
          case TimePeriod.YEAR:
            date.setFullYear(date.getFullYear() - i);
            break;
        }
        
        // Format date based on period
        let formattedDate: string;
        
        switch (period) {
          case TimePeriod.DAY:
            formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
            break;
          case TimePeriod.WEEK:
            formattedDate = `Week ${this.getWeekNumber(date)}, ${date.getFullYear()}`;
            break;
          case TimePeriod.MONTH:
            formattedDate = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            break;
          case TimePeriod.QUARTER:
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            formattedDate = `Q${quarter} ${date.getFullYear()}`;
            break;
          case TimePeriod.YEAR:
            formattedDate = date.getFullYear().toString();
            break;
          default:
            formattedDate = date.toISOString().split('T')[0];
        }
        
        // For demonstration, we'll generate random customer data
        // In a real implementation, this would come from the data warehouse
        const newCustomers = Math.floor(20 + Math.random() * 30);
        const churnedCustomers = Math.floor(Math.random() * 15);
        const netGrowth = newCustomers - churnedCustomers;
        
        result.push({
          date: formattedDate,
          newCustomers,
          churnedCustomers,
          netGrowth,
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error getting customer growth time series:', error);
      throw error;
    }
  }
  
  /**
   * Get start date for the specified time period
   * @param period Time period
   * @returns Start date
   */
  private getStartDateForPeriod(period: TimePeriod): Date {
    const now = new Date();
    
    switch (period) {
      case TimePeriod.DAY:
        // Start of current day
        now.setHours(0, 0, 0, 0);
        break;
      case TimePeriod.WEEK:
        // Start of current week (Sunday)
        const dayOfWeek = now.getDay();
        now.setDate(now.getDate() - dayOfWeek);
        now.setHours(0, 0, 0, 0);
        break;
      case TimePeriod.MONTH:
        // Start of current month
        now.setDate(1);
        now.setHours(0, 0, 0, 0);
        break;
      case TimePeriod.QUARTER:
        // Start of current quarter
        const month = now.getMonth();
        const quarterStartMonth = Math.floor(month / 3) * 3;
        now.setMonth(quarterStartMonth, 1);
        now.setHours(0, 0, 0, 0);
        break;
      case TimePeriod.YEAR:
        // Start of current year
        now.setMonth(0, 1);
        now.setHours(0, 0, 0, 0);
        break;
    }
    
    return now;
  }
  
  /**
   * Get SQL interval for the specified time period
   * @param period Time period
   * @returns SQL interval string
   */
  private getIntervalForPeriod(period: TimePeriod): string {
    switch (period) {
      case TimePeriod.DAY:
        return 'hour';
      case TimePeriod.WEEK:
        return 'day';
      case TimePeriod.MONTH:
        return 'day';
      case TimePeriod.QUARTER:
        return 'month';
      case TimePeriod.YEAR:
        return 'month';
      default:
        return 'day';
    }
  }
  
  /**
   * Get week number for a date
   * @param date Date to get week number for
   * @returns Week number (1-53)
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
