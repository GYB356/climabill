import { CarbonTrackingService, CarbonUsage, CarbonOffset } from './carbon-tracking-service';
import { OffsetProjectType } from './config';
import { cachedApiCall } from '../caching/carbonMetricsCache';

/**
 * Cached wrapper for the CarbonTrackingService
 * This class adds caching functionality to the CarbonTrackingService to improve performance
 * by reducing database queries and API calls for frequently accessed data.
 */
export class CachedCarbonTrackingService {
  private service: CarbonTrackingService;
  
  // Cache expiry times (in milliseconds)
  private static readonly USAGE_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  private static readonly OFFSET_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  private static readonly ESTIMATE_CACHE_EXPIRY = 2 * 60 * 1000; // 2 minutes
  
  constructor() {
    this.service = new CarbonTrackingService();
  }
  
  /**
   * Calculate carbon footprint based on usage metrics (not cached since it's a simple calculation)
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
    return this.service.calculateCarbonFootprint(usage);
  }
  
  /**
   * Track carbon usage for a user or organization (not cached as it's a write operation)
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
      name?: string;
    },
    organizationId?: string
  ): Promise<CarbonUsage> {
    // This is a write operation so we directly call the service
    const result = await this.service.trackCarbonUsage(userId, usage, period, organizationId);
    
    // Invalidate related cache entries
    // Implementation note: For a more sophisticated system, we could implement cache invalidation here
    
    return result;
  }
  
  /**
   * Get carbon usage for a specific period (cached)
   */
  async getCarbonUsageForPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
    organizationId?: string,
    departmentId?: string,
    projectId?: string
  ): Promise<CarbonUsage | null> {
    const cacheKey = `carbon-usage:${userId}:${startDate.toISOString()}:${endDate.toISOString()}:${organizationId || 'no-org'}:${departmentId || 'no-dept'}:${projectId || 'no-proj'}`;
    
    return cachedApiCall<CarbonUsage | null>(
      cacheKey,
      () => this.service.getCarbonUsageForPeriod(userId, startDate, endDate, organizationId, departmentId, projectId),
      CachedCarbonTrackingService.USAGE_CACHE_EXPIRY
    );
  }
  
  /**
   * Get total offset carbon for a specific period (cached)
   */
  async getOffsetCarbonForPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
    organizationId?: string
  ): Promise<number> {
    const cacheKey = `carbon-offset:${userId}:${startDate.toISOString()}:${endDate.toISOString()}:${organizationId || 'no-org'}`;
    
    return cachedApiCall<number>(
      cacheKey,
      () => this.service.getOffsetCarbonForPeriod(userId, startDate, endDate, organizationId),
      CachedCarbonTrackingService.OFFSET_CACHE_EXPIRY
    );
  }
  
  /**
   * Estimate carbon offset cost (cached with shorter expiry)
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
    const cacheKey = `carbon-estimate:${carbonInKg}:${projectType || 'any'}`;
    
    return cachedApiCall(
      cacheKey,
      () => this.service.estimateOffset(carbonInKg, projectType),
      CachedCarbonTrackingService.ESTIMATE_CACHE_EXPIRY
    );
  }
  
  /**
   * Purchase carbon offset (not cached as it's a write operation with side effects)
   */
  async purchaseOffset(
    userId: string,
    estimateId: string,
    organizationId?: string
  ): Promise<CarbonOffset> {
    // This is a write operation with financial implications, so we directly call the service
    return this.service.purchaseOffset(userId, estimateId, organizationId);
  }
  
  /**
   * Get carbon offset purchase history (cached)
   */
  async getOffsetHistory(
    userId: string,
    limit = 10,
    organizationId?: string
  ): Promise<CarbonOffset[]> {
    const cacheKey = `offset-history:${userId}:${limit}:${organizationId || 'no-org'}`;
    
    return cachedApiCall<CarbonOffset[]>(
      cacheKey,
      () => this.service.getOffsetHistory(userId, limit, organizationId),
      CachedCarbonTrackingService.OFFSET_CACHE_EXPIRY
    );
  }
}
