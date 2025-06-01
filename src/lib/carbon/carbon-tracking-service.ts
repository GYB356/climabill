import { db as firestore } from '../firebase/config';
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
import { CARBON_DEFAULTS, OffsetProjectType } from './config';
import { CloverlyClient } from './cloverly-client';

/**
 * Interface for carbon usage data
 */
export interface CarbonUsage {
  id?: string;
  userId: string;
  organizationId?: string;
  invoiceCount: number;
  emailCount: number;
  storageGb: number;
  apiCallCount: number;
  customUsage?: Array<{
    name: string;
    amount: number;
    unit: string;
    carbonInKg: number;
  }>;
  totalCarbonInKg: number;
  offsetCarbonInKg: number;
  remainingCarbonInKg: number;
  period: {
    startDate: Date | Timestamp;
    endDate: Date | Timestamp;
  };
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Interface for carbon offset purchase
 */
export interface CarbonOffset {
  id?: string;
  userId: string;
  organizationId?: string;
  purchaseId: string;
  estimateId: string;
  carbonInKg: number;
  costInUsdCents: number;
  projectType: OffsetProjectType;
  projectName: string;
  projectLocation: string;
  receiptUrl: string;
  certificateUrl?: string;
  status: string;
  purchaseDate: Date | Timestamp;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Service for tracking carbon usage and offsets
 */
export class CarbonTrackingService {
  private cloverlyClient: CloverlyClient;
  private readonly USAGE_COLLECTION = 'carbonUsage';
  private readonly OFFSET_COLLECTION = 'carbonOffsets';
  
  constructor() {
    this.cloverlyClient = new CloverlyClient();
  }
  
  /**
   * Calculate carbon footprint based on usage metrics
   * @param usage Usage metrics
   * @returns Total carbon footprint in kg CO2e
   */
  calculateCarbonFootprint(usage: {
    invoiceCount?: number;
    emailCount?: number;
    storageGb?: number;
    apiCallCount?: number;
    customUsage?: Array<{
      name: string;
      amount: number;
      unit: string;
      carbonInKg: number;
    }>;
  }): number {
    let totalCarbonInKg = 0;
    
    // Calculate carbon from invoices
    if (usage.invoiceCount) {
      totalCarbonInKg += usage.invoiceCount * CARBON_DEFAULTS.carbonPerInvoice;
    }
    
    // Calculate carbon from emails
    if (usage.emailCount) {
      totalCarbonInKg += usage.emailCount * CARBON_DEFAULTS.carbonPerEmail;
    }
    
    // Calculate carbon from storage
    if (usage.storageGb) {
      totalCarbonInKg += usage.storageGb * CARBON_DEFAULTS.carbonPerGbStorage;
    }
    
    // Calculate carbon from API calls
    if (usage.apiCallCount) {
      totalCarbonInKg += usage.apiCallCount * CARBON_DEFAULTS.carbonPerApiCall;
    }
    
    // Add custom usage
    if (usage.customUsage && usage.customUsage.length > 0) {
      for (const item of usage.customUsage) {
        totalCarbonInKg += item.carbonInKg;
      }
    }
    
    return totalCarbonInKg;
  }
  
  /**
   * Track carbon usage for a user or organization
   * @param userId User ID
   * @param usage Usage metrics
   * @param period Period for the usage
   * @param organizationId Optional organization ID
   * @returns Created carbon usage record
   */
  async trackCarbonUsage(
    userId: string,
    usage: {
      invoiceCount?: number;
      emailCount?: number;
      storageGb?: number;
      apiCallCount?: number;
      customUsage?: Array<{
        name: string;
        amount: number;
        unit: string;
        carbonInKg: number;
      }>;
    },
    period: {
      startDate: Date;
      endDate: Date;
    },
    organizationId?: string
  ): Promise<CarbonUsage> {
    try {
      const now = Timestamp.now();
      
      // Calculate total carbon footprint
      const totalCarbonInKg = this.calculateCarbonFootprint(usage);
      
      // Get existing offsets for the period
      const offsetCarbonInKg = await this.getOffsetCarbonForPeriod(
        userId,
        period.startDate,
        period.endDate,
        organizationId
      );
      
      // Calculate remaining carbon
      const remainingCarbonInKg = Math.max(0, totalCarbonInKg - offsetCarbonInKg);
      
      // Create carbon usage record
      const carbonUsage: Omit<CarbonUsage, 'id'> = {
        userId,
        organizationId,
        invoiceCount: usage.invoiceCount || 0,
        emailCount: usage.emailCount || 0,
        storageGb: usage.storageGb || 0,
        apiCallCount: usage.apiCallCount || 0,
        customUsage: usage.customUsage || [],
        totalCarbonInKg,
        offsetCarbonInKg,
        remainingCarbonInKg,
        period: {
          startDate: Timestamp.fromDate(period.startDate),
          endDate: Timestamp.fromDate(period.endDate),
        },
        createdAt: now,
        updatedAt: now,
      };
      
      // Save to Firestore
      const docRef = await addDoc(collection(firestore, this.USAGE_COLLECTION), carbonUsage);
      
      return {
        ...carbonUsage,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error tracking carbon usage:', error);
      throw error;
    }
  }
  
  /**
   * Get carbon usage for a specific period
   * @param userId User ID
   * @param startDate Start date of the period
   * @param endDate End date of the period
   * @param organizationId Optional organization ID
   * @param departmentId Optional department ID for filtering
   * @param projectId Optional project ID for filtering
   * @returns Carbon usage record or null if not found
   */
  async getCarbonUsageForPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
    organizationId?: string,
    departmentId?: string,
    projectId?: string
  ): Promise<CarbonUsage | null> {
    try {
      // Create base query
      let q = query(
        collection(firestore, this.USAGE_COLLECTION),
        where('userId', '==', userId),
        where('period.startDate', '==', Timestamp.fromDate(startDate)),
        where('period.endDate', '==', Timestamp.fromDate(endDate))
      );
      
      // Add organization filter if provided
      if (organizationId) {
        q = query(
          collection(firestore, this.USAGE_COLLECTION),
          where('userId', '==', userId),
          where('organizationId', '==', organizationId),
          where('period.startDate', '==', Timestamp.fromDate(startDate)),
          where('period.endDate', '==', Timestamp.fromDate(endDate))
        );
      }
      
      // Add department filter if provided
      if (departmentId) {
        q = query(
          collection(firestore, this.USAGE_COLLECTION),
          where('userId', '==', userId),
          ...(organizationId ? [where('organizationId', '==', organizationId)] : []),
          where('departmentId', '==', departmentId),
          where('period.startDate', '==', Timestamp.fromDate(startDate)),
          where('period.endDate', '==', Timestamp.fromDate(endDate))
        );
      }
      
      // Add project filter if provided
      if (projectId) {
        q = query(
          collection(firestore, this.USAGE_COLLECTION),
          where('userId', '==', userId),
          ...(organizationId ? [where('organizationId', '==', organizationId)] : []),
          ...(departmentId ? [where('departmentId', '==', departmentId)] : []),
          where('projectId', '==', projectId),
          where('period.startDate', '==', Timestamp.fromDate(startDate)),
          where('period.endDate', '==', Timestamp.fromDate(endDate))
        );
      }
      
      // Execute query
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      
      return {
        ...doc.data(),
        id: doc.id,
      } as CarbonUsage;
    } catch (error) {
      console.error('Error getting carbon usage for period:', error);
      throw error;
    }
  }
  
  /**
   * Get total offset carbon for a specific period
   * @param userId User ID
   * @param startDate Start date of the period
   * @param endDate End date of the period
   * @param organizationId Optional organization ID
   * @returns Total offset carbon in kg CO2e
   */
  async getOffsetCarbonForPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
    organizationId?: string
  ): Promise<number> {
    try {
      // Create query
      let q = query(
        collection(firestore, this.OFFSET_COLLECTION),
        where('userId', '==', userId),
        where('purchaseDate', '>=', Timestamp.fromDate(startDate)),
        where('purchaseDate', '<=', Timestamp.fromDate(endDate))
      );
      
      // Add organization filter if provided
      if (organizationId) {
        q = query(
          collection(firestore, this.OFFSET_COLLECTION),
          where('userId', '==', userId),
          where('organizationId', '==', organizationId),
          where('purchaseDate', '>=', Timestamp.fromDate(startDate)),
          where('purchaseDate', '<=', Timestamp.fromDate(endDate))
        );
      }
      
      // Execute query
      const querySnapshot = await getDocs(q);
      
      // Sum up offset carbon
      let totalOffsetCarbonInKg = 0;
      
      querySnapshot.forEach(doc => {
        const offset = doc.data() as CarbonOffset;
        totalOffsetCarbonInKg += offset.carbonInKg;
      });
      
      return totalOffsetCarbonInKg;
    } catch (error) {
      console.error('Error getting offset carbon for period:', error);
      throw error;
    }
  }
  
  /**
   * Estimate carbon offset cost
   * @param carbonInKg Amount of carbon to offset in kg CO2e
   * @param projectType Optional project type preference
   * @returns Estimate details
   */
  async estimateOffset(
    carbonInKg: number,
    projectType?: OffsetProjectType
  ): Promise<{
    estimateId: string;
    carbonInKg: number;
    costInUsdCents: number;
    formattedCost: string;
    projectType?: string;
    projectName?: string;
    projectLocation?: string;
  }> {
    try {
      const estimate = await this.cloverlyClient.estimateOffset(carbonInKg, projectType);
      
      return {
        estimateId: estimate.slug,
        carbonInKg: estimate.carbon_in_kg,
        costInUsdCents: estimate.total_cost_in_usd_cents,
        formattedCost: estimate.pretty_cost,
        projectType: estimate.offset?.type,
        projectName: estimate.offset?.name,
        projectLocation: estimate.offset?.location.country,
      };
    } catch (error) {
      console.error('Error estimating carbon offset:', error);
      throw error;
    }
  }
  
  /**
   * Purchase carbon offset
   * @param userId User ID
   * @param estimateId Estimate ID from estimateOffset
   * @param organizationId Optional organization ID
   * @returns Carbon offset purchase details
   */
  async purchaseOffset(
    userId: string,
    estimateId: string,
    organizationId?: string
  ): Promise<CarbonOffset> {
    try {
      const now = Timestamp.now();
      
      // Purchase offset via Cloverly
      const purchase = await this.cloverlyClient.purchaseOffset(estimateId);
      
      // Create carbon offset record
      const carbonOffset: Omit<CarbonOffset, 'id'> = {
        userId,
        organizationId,
        purchaseId: purchase.slug,
        estimateId,
        carbonInKg: purchase.carbon_in_kg,
        costInUsdCents: purchase.total_cost_in_usd_cents,
        projectType: purchase.offset?.type as OffsetProjectType,
        projectName: purchase.offset?.name || 'Unknown Project',
        projectLocation: purchase.offset?.location.country || 'Unknown Location',
        receiptUrl: purchase.receipt_url,
        certificateUrl: purchase.renewable_certificate_url,
        status: purchase.state,
        purchaseDate: now,
        createdAt: now,
        updatedAt: now,
      };
      
      // Save to Firestore
      const docRef = await addDoc(collection(firestore, this.OFFSET_COLLECTION), carbonOffset);
      
      // Update carbon usage records for the current period
      await this.updateCarbonUsageAfterOffset(userId, carbonOffset.carbonInKg, organizationId);
      
      return {
        ...carbonOffset,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error purchasing carbon offset:', error);
      throw error;
    }
  }
  
  /**
   * Update carbon usage records after a new offset purchase
   * @param userId User ID
   * @param carbonInKg Amount of carbon offset in kg CO2e
   * @param organizationId Optional organization ID
   */
  private async updateCarbonUsageAfterOffset(
    userId: string,
    carbonInKg: number,
    organizationId?: string
  ): Promise<void> {
    try {
      // Get current date
      const now = new Date();
      
      // Get start of current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Get end of current month
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Get carbon usage for current month
      const carbonUsage = await this.getCarbonUsageForPeriod(
        userId,
        startOfMonth,
        endOfMonth,
        organizationId
      );
      
      if (carbonUsage) {
        // Update carbon usage record
        const updatedOffsetCarbonInKg = carbonUsage.offsetCarbonInKg + carbonInKg;
        const updatedRemainingCarbonInKg = Math.max(0, carbonUsage.totalCarbonInKg - updatedOffsetCarbonInKg);
        
        const docRef = doc(firestore, this.USAGE_COLLECTION, carbonUsage.id as string);
        
        await updateDoc(docRef, {
          offsetCarbonInKg: updatedOffsetCarbonInKg,
          remainingCarbonInKg: updatedRemainingCarbonInKg,
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Error updating carbon usage after offset:', error);
      throw error;
    }
  }
  
  /**
   * Get carbon offset purchase history
   * @param userId User ID
   * @param maxRecords Maximum number of records to return
   * @param organizationId Optional organization ID
   * @returns List of carbon offset purchases
   */
  async getCarbonOffsetHistory(
    userId: string,
    maxRecords = 10,
    organizationId?: string
  ): Promise<CarbonOffset[]> {
    try {
      // Create query
      let q = query(
        collection(firestore, this.OFFSET_COLLECTION),
        where('userId', '==', userId),
        orderBy('purchaseDate', 'desc'),
        limit(maxRecords)
      );
      
      // Add organization filter if provided
      if (organizationId) {
        q = query(
          collection(firestore, this.OFFSET_COLLECTION),
          where('userId', '==', userId),
          where('organizationId', '==', organizationId),
          orderBy('purchaseDate', 'desc'),
          limit(maxRecords)
        );
      }
      
      // Execute query
      const querySnapshot = await getDocs(q);
      
      // Convert to array of carbon offsets
      const carbonOffsets: CarbonOffset[] = [];
      
      querySnapshot.forEach(doc => {
        carbonOffsets.push({
          ...doc.data(),
          id: doc.id,
        } as CarbonOffset);
      });
      
      return carbonOffsets;
    } catch (error) {
      console.error('Error getting carbon offset history:', error);
      throw error;
    }
  }
  
  /**
   * Get carbon usage history
   * @param userId User ID
   * @param maxRecords Maximum number of records to return
   * @param organizationId Optional organization ID
   * @returns List of carbon usage records
   */
  async getCarbonUsageHistory(
    userId: string,
    maxRecords = 10,
    organizationId?: string
  ): Promise<CarbonUsage[]> {
    try {
      // Create query
      let q = query(
        collection(firestore, this.USAGE_COLLECTION),
        where('userId', '==', userId),
        orderBy('period.startDate', 'desc'),
        limit(maxRecords)
      );
      
      // Add organization filter if provided
      if (organizationId) {
        q = query(
          collection(firestore, this.USAGE_COLLECTION),
          where('userId', '==', userId),
          where('organizationId', '==', organizationId),
          orderBy('period.startDate', 'desc'),
          limit(maxRecords)
        );
      }
      
      // Execute query
      const querySnapshot = await getDocs(q);
      
      // Convert to array of carbon usage records
      const carbonUsages: CarbonUsage[] = [];
      
      querySnapshot.forEach(doc => {
        carbonUsages.push({
          ...doc.data(),
          id: doc.id,
        } as CarbonUsage);
      });
      
      return carbonUsages;
    } catch (error) {
      console.error('Error getting carbon usage history:', error);
      throw error;
    }
  }
  
  /**
   * Get available offset projects
   * @param projectType Optional project type filter
   * @returns List of available projects
   */
  async getAvailableProjects(
    projectType?: OffsetProjectType
  ): Promise<Array<{
    id: string;
    name: string;
    type: string;
    location: string;
    description: string;
    registry: string;
    registryUrl: string;
  }>> {
    try {
      const response = await this.cloverlyClient.getAvailableProjects(projectType);
      
      // Map to simplified project objects
      return response.data.map(project => ({
        id: project.id,
        name: project.name,
        type: project.type,
        location: `${project.location.city || ''}, ${project.location.state || ''}, ${project.location.country}`.replace(', ,', ','),
        description: project.description || '',
        registry: project.registry || '',
        registryUrl: project.registry_url || '',
      }));
    } catch (error) {
      console.error('Error getting available projects:', error);
      throw error;
    }
  }
  
  /**
   * Get carbon footprint summary for a user
   * @param userId User ID
   * @param organizationId Optional organization ID
   * @returns Carbon footprint summary
   */
  async getCarbonFootprintSummary(
    userId: string,
    organizationId?: string
  ): Promise<{
    totalCarbonInKg: number;
    offsetCarbonInKg: number;
    remainingCarbonInKg: number;
    offsetPercentage: number;
    totalOffsetPurchases: number;
    monthlyCarbonTrend: Array<{
      month: string;
      totalCarbonInKg: number;
      offsetCarbonInKg: number;
    }>;
  }> {
    try {
      // Get carbon usage history for the last 12 months
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      
      // Create query for carbon usage
      let usageQuery = query(
        collection(firestore, this.USAGE_COLLECTION),
        where('userId', '==', userId),
        where('period.startDate', '>=', Timestamp.fromDate(oneYearAgo)),
        orderBy('period.startDate', 'asc')
      );
      
      // Add organization filter if provided
      if (organizationId) {
        usageQuery = query(
          collection(firestore, this.USAGE_COLLECTION),
          where('userId', '==', userId),
          where('organizationId', '==', organizationId),
          where('period.startDate', '>=', Timestamp.fromDate(oneYearAgo)),
          orderBy('period.startDate', 'asc')
        );
      }
      
      // Execute query
      const usageSnapshot = await getDocs(usageQuery);
      
      // Initialize summary data
      let totalCarbonInKg = 0;
      let offsetCarbonInKg = 0;
      let remainingCarbonInKg = 0;
      
      // Initialize monthly trend data
      const monthlyData: Record<string, {
        totalCarbonInKg: number;
        offsetCarbonInKg: number;
      }> = {};
      
      // Process usage data
      usageSnapshot.forEach(doc => {
        const usage = doc.data() as CarbonUsage;
        
        // Add to totals
        totalCarbonInKg += usage.totalCarbonInKg;
        offsetCarbonInKg += usage.offsetCarbonInKg;
        remainingCarbonInKg += usage.remainingCarbonInKg;
        
        // Add to monthly trend
        const startDate = usage.period.startDate instanceof Timestamp 
          ? usage.period.startDate.toDate() 
          : usage.period.startDate;
        
        const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            totalCarbonInKg: 0,
            offsetCarbonInKg: 0,
          };
        }
        
        monthlyData[monthKey].totalCarbonInKg += usage.totalCarbonInKg;
        monthlyData[monthKey].offsetCarbonInKg += usage.offsetCarbonInKg;
      });
      
      // Get count of offset purchases
      let offsetQuery = query(
        collection(firestore, this.OFFSET_COLLECTION),
        where('userId', '==', userId)
      );
      
      // Add organization filter if provided
      if (organizationId) {
        offsetQuery = query(
          collection(firestore, this.OFFSET_COLLECTION),
          where('userId', '==', userId),
          where('organizationId', '==', organizationId)
        );
      }
      
      // Execute query
      const offsetSnapshot = await getDocs(offsetQuery);
      const totalOffsetPurchases = offsetSnapshot.size;
      
      // Calculate offset percentage
      const offsetPercentage = totalCarbonInKg > 0 
        ? (offsetCarbonInKg / totalCarbonInKg) * 100 
        : 0;
      
      // Convert monthly data to array
      const monthlyCarbonTrend = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        totalCarbonInKg: data.totalCarbonInKg,
        offsetCarbonInKg: data.offsetCarbonInKg,
      }));
      
      return {
        totalCarbonInKg,
        offsetCarbonInKg,
        remainingCarbonInKg,
        offsetPercentage,
        totalOffsetPurchases,
        monthlyCarbonTrend,
      };
    } catch (error) {
      console.error('Error getting carbon footprint summary:', error);
      throw error;
    }
  }

  /**
   * Get emissions time series data for analytics
   * @param organizationId Organization ID
   * @param startDate Start date
   * @param endDate End date
   * @param departmentId Optional department filter
   * @param projectId Optional project filter
   * @returns Time series emissions data
   */
  async getEmissionsTimeSeries(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    departmentId?: string,
    projectId?: string
  ): Promise<Array<{
    date: Date;
    totalEmissions: number;
    offsetEmissions: number;
  }>> {
    try {
      // Create query for carbon usage in the date range
      let q = query(
        collection(firestore, this.USAGE_COLLECTION),
        where('organizationId', '==', organizationId),
        where('period.startDate', '>=', Timestamp.fromDate(startDate)),
        where('period.startDate', '<=', Timestamp.fromDate(endDate)),
        orderBy('period.startDate', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const timeSeriesData: Array<{
        date: Date;
        totalEmissions: number;
        offsetEmissions: number;
      }> = [];

      querySnapshot.forEach(doc => {
        const usage = doc.data() as CarbonUsage;
        const startDate = usage.period.startDate instanceof Timestamp 
          ? usage.period.startDate.toDate() 
          : usage.period.startDate;

        timeSeriesData.push({
          date: startDate,
          totalEmissions: usage.totalCarbonInKg,
          offsetEmissions: usage.offsetCarbonInKg,
        });
      });

      return timeSeriesData;
    } catch (error) {
      console.error('Error getting emissions time series:', error);
      throw error;
    }
  }

  /**
   * Get emissions breakdown by source for analytics
   * @param organizationId Organization ID
   * @param startDate Start date
   * @param endDate End date
   * @param departmentId Optional department filter
   * @param projectId Optional project filter
   * @returns Emissions breakdown by source
   */
  async getEmissionsBreakdown(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    departmentId?: string,
    projectId?: string
  ): Promise<Array<{
    source: string;
    emissions: number;
    percentage: number;
  }>> {
    try {
      // Create query for carbon usage in the date range
      let q = query(
        collection(firestore, this.USAGE_COLLECTION),
        where('organizationId', '==', organizationId),
        where('period.startDate', '>=', Timestamp.fromDate(startDate)),
        where('period.startDate', '<=', Timestamp.fromDate(endDate))
      );

      const querySnapshot = await getDocs(q);
      
      // Aggregate emissions by source
      const sourceTotals = {
        invoices: 0,
        emails: 0,
        storage: 0,
        apiCalls: 0,
        custom: 0,
      };

      let totalEmissions = 0;

      querySnapshot.forEach(doc => {
        const usage = doc.data() as CarbonUsage;
        
        sourceTotals.invoices += usage.invoiceCount * CARBON_DEFAULTS.carbonPerInvoice;
        sourceTotals.emails += usage.emailCount * CARBON_DEFAULTS.carbonPerEmail;
        sourceTotals.storage += usage.storageGb * CARBON_DEFAULTS.carbonPerGbStorage;
        sourceTotals.apiCalls += usage.apiCallCount * CARBON_DEFAULTS.carbonPerApiCall;
        
        if (usage.customUsage) {
          for (const custom of usage.customUsage) {
            sourceTotals.custom += custom.carbonInKg;
          }
        }

        totalEmissions += usage.totalCarbonInKg;
      });

      // Convert to breakdown format
      const breakdown = [
        { source: 'Invoices', emissions: sourceTotals.invoices, percentage: 0 },
        { source: 'Emails', emissions: sourceTotals.emails, percentage: 0 },
        { source: 'Storage', emissions: sourceTotals.storage, percentage: 0 },
        { source: 'API Calls', emissions: sourceTotals.apiCalls, percentage: 0 },
        { source: 'Custom', emissions: sourceTotals.custom, percentage: 0 },
      ].filter(item => item.emissions > 0);

      // Calculate percentages
      breakdown.forEach(item => {
        item.percentage = totalEmissions > 0 ? (item.emissions / totalEmissions) * 100 : 0;
      });

      return breakdown;
    } catch (error) {
      console.error('Error getting emissions breakdown:', error);
      throw error;
    }
  }

  /**
   * Get emissions trends for analytics
   * @param organizationId Organization ID
   * @param startDate Start date
   * @param endDate End date
   * @param departmentId Optional department filter
   * @param projectId Optional project filter
   * @returns Emissions trends data
   */
  async getEmissionsTrends(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    departmentId?: string,
    projectId?: string
  ): Promise<Array<{
    period: string;
    change: number;
    percentageChange: number;
  }>> {
    try {
      // Get current period data
      const currentQuery = query(
        collection(firestore, this.USAGE_COLLECTION),
        where('organizationId', '==', organizationId),
        where('period.startDate', '>=', Timestamp.fromDate(startDate)),
        where('period.startDate', '<=', Timestamp.fromDate(endDate))
      );

      const currentSnapshot = await getDocs(currentQuery);
      let currentTotal = 0;
      currentSnapshot.forEach(doc => {
        const usage = doc.data() as CarbonUsage;
        currentTotal += usage.totalCarbonInKg;
      });

      // Calculate previous periods for comparison
      const trends = [];
      
      // Week over Week (if applicable)
      if (endDate.getTime() - startDate.getTime() <= 7 * 24 * 60 * 60 * 1000) {
        const prevWeekStart = new Date(startDate);
        prevWeekStart.setDate(startDate.getDate() - 7);
        const prevWeekEnd = new Date(endDate);
        prevWeekEnd.setDate(endDate.getDate() - 7);

        const prevWeekQuery = query(
          collection(firestore, this.USAGE_COLLECTION),
          where('organizationId', '==', organizationId),
          where('period.startDate', '>=', Timestamp.fromDate(prevWeekStart)),
          where('period.startDate', '<=', Timestamp.fromDate(prevWeekEnd))
        );

        const prevWeekSnapshot = await getDocs(prevWeekQuery);
        let prevWeekTotal = 0;
        prevWeekSnapshot.forEach(doc => {
          const usage = doc.data() as CarbonUsage;
          prevWeekTotal += usage.totalCarbonInKg;
        });

        const weekChange = currentTotal - prevWeekTotal;
        const weekPercentageChange = prevWeekTotal > 0 ? (weekChange / prevWeekTotal) * 100 : 0;

        trends.push({
          period: 'Week over Week',
          change: weekChange,
          percentageChange: weekPercentageChange,
        });
      }

      // Month over Month
      const prevMonthStart = new Date(startDate);
      prevMonthStart.setMonth(startDate.getMonth() - 1);
      const prevMonthEnd = new Date(endDate);
      prevMonthEnd.setMonth(endDate.getMonth() - 1);

      const prevMonthQuery = query(
        collection(firestore, this.USAGE_COLLECTION),
        where('organizationId', '==', organizationId),
        where('period.startDate', '>=', Timestamp.fromDate(prevMonthStart)),
        where('period.startDate', '<=', Timestamp.fromDate(prevMonthEnd))
      );

      const prevMonthSnapshot = await getDocs(prevMonthQuery);
      let prevMonthTotal = 0;
      prevMonthSnapshot.forEach(doc => {
        const usage = doc.data() as CarbonUsage;
        prevMonthTotal += usage.totalCarbonInKg;
      });

      const monthChange = currentTotal - prevMonthTotal;
      const monthPercentageChange = prevMonthTotal > 0 ? (monthChange / prevMonthTotal) * 100 : 0;

      trends.push({
        period: 'Month over Month',
        change: monthChange,
        percentageChange: monthPercentageChange,
      });

      // Year over Year
      const prevYearStart = new Date(startDate);
      prevYearStart.setFullYear(startDate.getFullYear() - 1);
      const prevYearEnd = new Date(endDate);
      prevYearEnd.setFullYear(endDate.getFullYear() - 1);

      const prevYearQuery = query(
        collection(firestore, this.USAGE_COLLECTION),
        where('organizationId', '==', organizationId),
        where('period.startDate', '>=', Timestamp.fromDate(prevYearStart)),
        where('period.startDate', '<=', Timestamp.fromDate(prevYearEnd))
      );

      const prevYearSnapshot = await getDocs(prevYearQuery);
      let prevYearTotal = 0;
      prevYearSnapshot.forEach(doc => {
        const usage = doc.data() as CarbonUsage;
        prevYearTotal += usage.totalCarbonInKg;
      });

      const yearChange = currentTotal - prevYearTotal;
      const yearPercentageChange = prevYearTotal > 0 ? (yearChange / prevYearTotal) * 100 : 0;

      trends.push({
        period: 'Year over Year',
        change: yearChange,
        percentageChange: yearPercentageChange,
      });

      return trends;
    } catch (error) {
      console.error('Error getting emissions trends:', error);
      throw error;
    }
  }
}
