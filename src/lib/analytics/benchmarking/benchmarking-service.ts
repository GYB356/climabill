import { 
  BenchmarkResult, 
  BenchmarkMetric, 
  Industry, 
  CompanySize, 
  MetricType, 
  SharingPreferences,
  BestPractice
} from './types';

/**
 * Service for industry benchmarking and best practices
 */
export class BenchmarkingService {
  /**
   * Get industry benchmarks for an organization
   * @param organizationId Organization ID
   * @param industryId Industry ID
   * @param metrics Metrics to benchmark
   * @returns Benchmark result
   */
  async getIndustryBenchmarks(
    organizationId: string,
    industryId: Industry,
    metrics: MetricType[] = [MetricType.CARBON_EMISSIONS]
  ): Promise<BenchmarkResult> {
    try {
      // Get organization data
      const organizationData = await this.getOrganizationData(organizationId);
      
      // Get company size
      const companySize = await this.getCompanySize(organizationId);
      
      // Get industry benchmarks
      const benchmarkMetrics: BenchmarkMetric[] = [];
      
      for (const metric of metrics) {
        const benchmarkMetric = await this.calculateBenchmarkMetric(
          organizationId,
          industryId,
          companySize,
          metric
        );
        
        benchmarkMetrics.push(benchmarkMetric);
      }
      
      return {
        organizationId,
        industryId,
        companySize,
        metrics: benchmarkMetrics,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting industry benchmarks:', error);
      throw new Error('Failed to get industry benchmarks');
    }
  }
  
  /**
   * Opt in to anonymous data sharing
   * @param organizationId Organization ID
   * @param sharingPreferences Sharing preferences
   */
  async optInToDataSharing(
    organizationId: string,
    sharingPreferences: SharingPreferences
  ): Promise<void> {
    try {
      // In a real implementation, this would save to a database
      console.log(`Organization ${organizationId} opted in to data sharing:`, sharingPreferences);
      
      // Record data sharing preferences
      // This is a placeholder for actual implementation
    } catch (error) {
      console.error('Error opting in to data sharing:', error);
      throw new Error('Failed to opt in to data sharing');
    }
  }
  
  /**
   * Get best practice recommendations
   * @param organizationId Organization ID
   * @param industryId Industry ID
   * @returns List of best practices
   */
  async getBestPracticeRecommendations(
    organizationId: string,
    industryId: Industry
  ): Promise<BestPractice[]> {
    try {
      // Get organization metrics
      const organizationMetrics = await this.getOrganizationMetrics(organizationId);
      
      // Get company size
      const companySize = await this.getCompanySize(organizationId);
      
      // Get all best practices for the industry
      const allPractices = await this.getAllBestPractices(industryId);
      
      // Filter and sort practices based on organization metrics and company size
      const recommendedPractices = this.filterAndSortPractices(
        allPractices,
        organizationMetrics,
        companySize
      );
      
      return recommendedPractices;
    } catch (error) {
      console.error('Error getting best practice recommendations:', error);
      throw new Error('Failed to get best practice recommendations');
    }
  }
  
  /**
   * Calculate benchmark metric
   * @param organizationId Organization ID
   * @param industryId Industry ID
   * @param companySize Company size
   * @param metricType Metric type
   * @returns Benchmark metric
   */
  private async calculateBenchmarkMetric(
    organizationId: string,
    industryId: Industry,
    companySize: CompanySize,
    metricType: MetricType
  ): Promise<BenchmarkMetric> {
    // Get organization value for the metric
    const organizationValue = await this.getOrganizationMetricValue(
      organizationId,
      metricType
    );
    
    // Get industry statistics
    const industryStats = await this.getIndustryStatistics(
      industryId,
      companySize,
      metricType
    );
    
    // Calculate percentile
    const percentile = this.calculatePercentile(
      organizationValue,
      industryStats.values
    );
    
    // Return benchmark metric
    return {
      metricType,
      value: organizationValue,
      unit: this.getUnitForMetric(metricType),
      percentile,
      industryAverage: industryStats.average,
      industryBest: industryStats.best,
      industryWorst: industryStats.worst
    };
  }
  
  /**
   * Get organization data
   * @param organizationId Organization ID
   * @returns Organization data
   */
  private async getOrganizationData(organizationId: string): Promise<any> {
    // In a real implementation, this would fetch from a database
    // For now, we'll return mock data
    return {
      id: organizationId,
      name: 'Example Organization',
      industry: Industry.TECHNOLOGY,
      size: CompanySize.MEDIUM
    };
  }
  
  /**
   * Get company size
   * @param organizationId Organization ID
   * @returns Company size
   */
  private async getCompanySize(organizationId: string): Promise<CompanySize> {
    // In a real implementation, this would fetch from a database
    // For now, we'll return mock data
    return CompanySize.MEDIUM;
  }
  
  /**
   * Get organization metrics
   * @param organizationId Organization ID
   * @returns Organization metrics
   */
  private async getOrganizationMetrics(organizationId: string): Promise<Record<MetricType, number>> {
    // In a real implementation, this would fetch from a database
    // For now, we'll return mock data
    return {
      [MetricType.CARBON_EMISSIONS]: 120,
      [MetricType.ENERGY_USAGE]: 5000,
      [MetricType.WATER_USAGE]: 2000,
      [MetricType.WASTE_GENERATED]: 500,
      [MetricType.RENEWABLE_ENERGY_PERCENTAGE]: 30
    };
  }
  
  /**
   * Get organization metric value
   * @param organizationId Organization ID
   * @param metricType Metric type
   * @returns Metric value
   */
  private async getOrganizationMetricValue(
    organizationId: string,
    metricType: MetricType
  ): Promise<number> {
    // In a real implementation, this would fetch from a database
    // For now, we'll return mock data
    const metrics = await this.getOrganizationMetrics(organizationId);
    return metrics[metricType];
  }
  
  /**
   * Get industry statistics
   * @param industryId Industry ID
   * @param companySize Company size
   * @param metricType Metric type
   * @returns Industry statistics
   */
  private async getIndustryStatistics(
    industryId: Industry,
    companySize: CompanySize,
    metricType: MetricType
  ): Promise<{ average: number; best: number; worst: number; values: number[] }> {
    // In a real implementation, this would fetch from a database
    // For now, we'll return mock data based on industry and company size
    
    let average, best, worst;
    const values: number[] = [];
    
    switch (metricType) {
      case MetricType.CARBON_EMISSIONS:
        if (industryId === Industry.TECHNOLOGY) {
          average = 150;
          best = 50;
          worst = 300;
          values = [50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300];
        } else if (industryId === Industry.MANUFACTURING) {
          average = 500;
          best = 200;
          worst = 1000;
          values = [200, 300, 400, 500, 600, 700, 800, 900, 1000];
        } else {
          average = 200;
          best = 100;
          worst = 400;
          values = [100, 150, 200, 250, 300, 350, 400];
        }
        break;
        
      case MetricType.ENERGY_USAGE:
        if (industryId === Industry.TECHNOLOGY) {
          average = 6000;
          best = 3000;
          worst = 10000;
          values = [3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];
        } else if (industryId === Industry.MANUFACTURING) {
          average = 15000;
          best = 8000;
          worst = 25000;
          values = [8000, 10000, 12000, 15000, 18000, 20000, 25000];
        } else {
          average = 8000;
          best = 4000;
          worst = 15000;
          values = [4000, 6000, 8000, 10000, 12000, 15000];
        }
        break;
        
      case MetricType.WATER_USAGE:
        if (industryId === Industry.TECHNOLOGY) {
          average = 3000;
          best = 1000;
          worst = 5000;
          values = [1000, 2000, 3000, 4000, 5000];
        } else if (industryId === Industry.MANUFACTURING) {
          average = 10000;
          best = 5000;
          worst = 20000;
          values = [5000, 7500, 10000, 12500, 15000, 17500, 20000];
        } else {
          average = 5000;
          best = 2000;
          worst = 10000;
          values = [2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];
        }
        break;
        
      case MetricType.WASTE_GENERATED:
        if (industryId === Industry.TECHNOLOGY) {
          average = 800;
          best = 300;
          worst = 1500;
          values = [300, 500, 800, 1000, 1200, 1500];
        } else if (industryId === Industry.MANUFACTURING) {
          average = 2000;
          best = 1000;
          worst = 4000;
          values = [1000, 1500, 2000, 2500, 3000, 3500, 4000];
        } else {
          average = 1000;
          best = 500;
          worst = 2000;
          values = [500, 750, 1000, 1250, 1500, 1750, 2000];
        }
        break;
        
      case MetricType.RENEWABLE_ENERGY_PERCENTAGE:
        if (industryId === Industry.TECHNOLOGY) {
          average = 40;
          best = 80;
          worst = 10;
          values = [10, 20, 30, 40, 50, 60, 70, 80];
        } else if (industryId === Industry.MANUFACTURING) {
          average = 20;
          best = 50;
          worst = 5;
          values = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
        } else {
          average = 30;
          best = 60;
          worst = 10;
          values = [10, 20, 30, 40, 50, 60];
        }
        break;
        
      default:
        average = 100;
        best = 50;
        worst = 200;
        values = [50, 75, 100, 125, 150, 175, 200];
    }
    
    // Adjust based on company size
    if (companySize === CompanySize.SMALL) {
      average *= 0.7;
      best *= 0.7;
      worst *= 0.7;
      values = values.map(v => v * 0.7);
    } else if (companySize === CompanySize.LARGE) {
      average *= 1.3;
      best *= 1.3;
      worst *= 1.3;
      values = values.map(v => v * 1.3);
    } else if (companySize === CompanySize.ENTERPRISE) {
      average *= 1.5;
      best *= 1.5;
      worst *= 1.5;
      values = values.map(v => v * 1.5);
    }
    
    return { average, best, worst, values };
  }
  
  /**
   * Calculate percentile
   * @param value Value
   * @param values Array of values
   * @returns Percentile (0-100)
   */
  private calculatePercentile(value: number, values: number[]): number {
    // Sort values
    const sortedValues = [...values].sort((a, b) => a - b);
    
    // Find position of value
    let position = 0;
    for (let i = 0; i < sortedValues.length; i++) {
      if (value <= sortedValues[i]) {
        position = i;
        break;
      }
      
      if (i === sortedValues.length - 1) {
        position = sortedValues.length;
      }
    }
    
    // Calculate percentile
    const percentile = (position / sortedValues.length) * 100;
    
    // For metrics where lower is better (like emissions), invert the percentile
    if (this.isLowerBetter(MetricType.CARBON_EMISSIONS)) {
      return 100 - percentile;
    }
    
    return percentile;
  }
  
  /**
   * Check if lower value is better for a metric
   * @param metricType Metric type
   * @returns True if lower is better
   */
  private isLowerBetter(metricType: MetricType): boolean {
    return [
      MetricType.CARBON_EMISSIONS,
      MetricType.ENERGY_USAGE,
      MetricType.WATER_USAGE,
      MetricType.WASTE_GENERATED
    ].includes(metricType);
  }
  
  /**
   * Get unit for metric
   * @param metricType Metric type
   * @returns Unit
   */
  private getUnitForMetric(metricType: MetricType): string {
    switch (metricType) {
      case MetricType.CARBON_EMISSIONS:
        return 'kg CO₂e';
      case MetricType.ENERGY_USAGE:
        return 'kWh';
      case MetricType.WATER_USAGE:
        return 'liters';
      case MetricType.WASTE_GENERATED:
        return 'kg';
      case MetricType.RENEWABLE_ENERGY_PERCENTAGE:
        return '%';
      default:
        return '';
    }
  }
  
  /**
   * Get all best practices
   * @param industryId Industry ID
   * @returns List of best practices
   */
  private async getAllBestPractices(industryId: Industry): Promise<BestPractice[]> {
    // In a real implementation, this would fetch from a database
    // For now, we'll return mock data
    
    // Common best practices for all industries
    const commonPractices: BestPractice[] = [
      {
        id: 'bp-001',
        title: 'Implement Energy-Efficient Lighting',
        description: 'Replace traditional lighting with LED bulbs and install motion sensors to reduce energy consumption.',
        impact: 'medium',
        implementationDifficulty: 'easy',
        metrics: [MetricType.ENERGY_USAGE, MetricType.CARBON_EMISSIONS],
        industryId: Industry.TECHNOLOGY,
        caseStudies: [
          {
            id: 'cs-001',
            companyName: 'TechCorp',
            description: 'Replaced all office lighting with LEDs and installed motion sensors in common areas.',
            results: '30% reduction in lighting energy consumption.',
            implementationTime: '2 months',
            roi: '18 months'
          }
        ]
      },
      {
        id: 'bp-002',
        title: 'Optimize HVAC Systems',
        description: 'Implement smart thermostats and regular maintenance to improve heating and cooling efficiency.',
        impact: 'high',
        implementationDifficulty: 'medium',
        metrics: [MetricType.ENERGY_USAGE, MetricType.CARBON_EMISSIONS],
        industryId: Industry.TECHNOLOGY,
        caseStudies: [
          {
            id: 'cs-002',
            companyName: 'EcoTech',
            description: 'Installed smart thermostats and implemented a preventive maintenance schedule.',
            results: '25% reduction in HVAC energy consumption.',
            implementationTime: '3 months',
            roi: '24 months'
          }
        ]
      },
      {
        id: 'bp-003',
        title: 'Implement Water Conservation Measures',
        description: 'Install low-flow fixtures and implement water recycling systems.',
        impact: 'medium',
        implementationDifficulty: 'medium',
        metrics: [MetricType.WATER_USAGE],
        industryId: Industry.TECHNOLOGY,
        caseStudies: [
          {
            id: 'cs-003',
            companyName: 'WaterWise',
            description: 'Installed low-flow fixtures in all facilities and implemented greywater recycling.',
            results: '40% reduction in water consumption.',
            implementationTime: '4 months',
            roi: '30 months'
          }
        ]
      }
    ];
    
    // Industry-specific best practices
    let industryPractices: BestPractice[] = [];
    
    switch (industryId) {
      case Industry.TECHNOLOGY:
        industryPractices = [
          {
            id: 'bp-tech-001',
            title: 'Optimize Data Center Cooling',
            description: 'Implement hot/cold aisle containment and raise data center temperature to reduce cooling needs.',
            impact: 'high',
            implementationDifficulty: 'medium',
            metrics: [MetricType.ENERGY_USAGE, MetricType.CARBON_EMISSIONS],
            industryId: Industry.TECHNOLOGY,
            caseStudies: [
              {
                id: 'cs-tech-001',
                companyName: 'DataCorp',
                description: 'Implemented hot/cold aisle containment and raised temperature by 2°C.',
                results: '35% reduction in data center cooling energy.',
                implementationTime: '6 months',
                roi: '18 months'
              }
            ]
          },
          {
            id: 'bp-tech-002',
            title: 'Implement Server Virtualization',
            description: 'Consolidate physical servers through virtualization to reduce energy consumption and hardware needs.',
            impact: 'high',
            implementationDifficulty: 'medium',
            metrics: [MetricType.ENERGY_USAGE, MetricType.CARBON_EMISSIONS, MetricType.WASTE_GENERATED],
            industryId: Industry.TECHNOLOGY,
            caseStudies: [
              {
                id: 'cs-tech-002',
                companyName: 'VirtualTech',
                description: 'Reduced physical servers from 100 to 20 through virtualization.',
                results: '70% reduction in server energy consumption.',
                implementationTime: '8 months',
                roi: '12 months'
              }
            ]
          }
        ];
        break;
        
      case Industry.MANUFACTURING:
        industryPractices = [
          {
            id: 'bp-mfg-001',
            title: 'Optimize Production Scheduling',
            description: 'Implement production scheduling to minimize equipment startup and shutdown cycles.',
            impact: 'high',
            implementationDifficulty: 'medium',
            metrics: [MetricType.ENERGY_USAGE, MetricType.CARBON_EMISSIONS],
            industryId: Industry.MANUFACTURING,
            caseStudies: [
              {
                id: 'cs-mfg-001',
                companyName: 'EfficientMfg',
                description: 'Implemented production scheduling software to optimize equipment usage.',
                results: '20% reduction in energy consumption.',
                implementationTime: '6 months',
                roi: '24 months'
              }
            ]
          },
          {
            id: 'bp-mfg-002',
            title: 'Implement Waste Heat Recovery',
            description: 'Capture and reuse waste heat from manufacturing processes.',
            impact: 'high',
            implementationDifficulty: 'hard',
            metrics: [MetricType.ENERGY_USAGE, MetricType.CARBON_EMISSIONS],
            industryId: Industry.MANUFACTURING,
            caseStudies: [
              {
                id: 'cs-mfg-002',
                companyName: 'HeatRecovery',
                description: 'Installed heat exchangers to capture waste heat from furnaces.',
                results: '30% reduction in heating energy consumption.',
                implementationTime: '12 months',
                roi: '36 months'
              }
            ]
          }
        ];
        break;
        
      default:
        industryPractices = [];
    }
    
    return [...commonPractices, ...industryPractices];
  }
  
  /**
   * Filter and sort practices
   * @param practices All practices
   * @param organizationMetrics Organization metrics
   * @param companySize Company size
   * @returns Filtered and sorted practices
   */
  private filterAndSortPractices(
    practices: BestPractice[],
    organizationMetrics: Record<MetricType, number>,
    companySize: CompanySize
  ): BestPractice[] {
    // Calculate potential impact for each practice
    const practicesWithImpact = practices.map(practice => {
      // Calculate average percentile for relevant metrics
      let totalPercentile = 0;
      let metricCount = 0;
      
      for (const metric of practice.metrics) {
        if (organizationMetrics[metric] !== undefined) {
          // Get industry statistics for this metric
          const industryStats = this.getIndustryStatisticsSync(
            practice.industryId,
            companySize,
            metric
          );
          
          // Calculate percentile
          const percentile = this.calculatePercentile(
            organizationMetrics[metric],
            industryStats.values
          );
          
          totalPercentile += percentile;
          metricCount++;
        }
      }
      
      const averagePercentile = metricCount > 0 ? totalPercentile / metricCount : 0;
      
      // Calculate potential impact (lower percentile means more room for improvement)
      const potentialImpact = 100 - averagePercentile;
      
      return {
        practice,
        potentialImpact
      };
    });
    
    // Sort by potential impact (highest first)
    practicesWithImpact.sort((a, b) => b.potentialImpact - a.potentialImpact);
    
    // Return sorted practices
    return practicesWithImpact.map(item => item.practice);
  }
  
  /**
   * Get industry statistics (synchronous version)
   * @param industryId Industry ID
   * @param companySize Company size
   * @param metricType Metric type
   * @returns Industry statistics
   */
  private getIndustryStatisticsSync(
    industryId: Industry,
    companySize: CompanySize,
    metricType: MetricType
  ): { average: number; best: number; worst: number; values: number[] } {
    // This is a synchronous version of getIndustryStatistics for use in filterAndSortPractices
    // In a real implementation, this would use cached data or a different approach
    
    let average, best, worst;
    const values: number[] = [];
    
    switch (metricType) {
      case MetricType.CARBON_EMISSIONS:
        if (industryId === Industry.TECHNOLOGY) {
          average = 150;
          best = 50;
          worst = 300;
          values.push(50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300);
        } else if (industryId === Industry.MANUFACTURING) {
          average = 500;
          best = 200;
          worst = 1000;
          values.push(200, 300, 400, 500, 600, 700, 800, 900, 1000);
        } else {
          average = 200;
          best = 100;
          worst = 400;
          values.push(100, 150, 200, 250, 300, 350, 400);
        }
        break;
        
      // Other metrics omitted for brevity (same as in getIndustryStatistics)
      
      default:
        average = 100;
        best = 50;
        worst = 200;
        values.push(50, 75, 100, 125, 150, 175, 200);
    }
    
    // Adjust based on company size
    if (companySize === CompanySize.SMALL) {
      average *= 0.7;
      best *= 0.7;
      worst *= 0.7;
      values = values.map(v => v * 0.7);
    } else if (companySize === CompanySize.LARGE) {
      average *= 1.3;
      best *= 1.3;
      worst *= 1.3;
      values = values.map(v => v * 1.3);
    } else if (companySize === CompanySize.ENTERPRISE) {
      average *= 1.5;
      best *= 1.5;
      worst *= 1.5;
      values = values.map(v => v * 1.5);
    }
    
    return { average, best, worst, values };
  }
}
