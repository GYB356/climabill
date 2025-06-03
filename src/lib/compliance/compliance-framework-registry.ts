/**
 * Compliance Framework Registry
 * 
 * Provides a central registry for managing compliance frameworks
 * such as CSRD, ESRS, SEC Climate Disclosure, and GHG Protocol.
 */

/**
 * A requirement within a compliance framework
 */
export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: 'disclosure' | 'measurement' | 'reporting' | 'verification' | 'other';
  level: 'mandatory' | 'recommended' | 'optional';
  evidenceTypes: string[];
  guidance?: string;
  validationCriteria?: string[];
}

/**
 * Configuration for reporting periods within a framework
 */
export interface ReportingPeriodConfig {
  periodType: 'annual' | 'quarterly' | 'monthly' | 'custom';
  periodStartMonth?: number; // 1-12
  periodStartDay?: number; // 1-31
  customPeriodLengthDays?: number;
  gracePeriodDays: number;
}

/**
 * Configuration for reporting deadlines
 */
export interface DeadlineConfig {
  id: string;
  name: string;
  description: string;
  relativeDays: number; // Days after period end
  category: 'submission' | 'verification' | 'publication' | 'other';
  absoluteDate?: string; // YYYY-MM-DD
}

/**
 * A regulatory compliance framework
 */
export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  category: 'emissions' | 'sustainability' | 'financial' | 'general';
  region: string[];
  applicableSectors: string[];
  requirements: ComplianceRequirement[];
  reportingPeriods: ReportingPeriodConfig;
  deadlines: DeadlineConfig[];
  website?: string;
  referenceDocuments?: string[];
  effectiveDate: string; // YYYY-MM-DD
  lastUpdated: string; // YYYY-MM-DD
}

/**
 * Registry for compliance frameworks
 */
export class ComplianceFrameworkRegistry {
  private frameworks: Map<string, ComplianceFramework> = new Map();
  private static instance: ComplianceFrameworkRegistry;
  
  /**
   * Get the singleton instance of the registry
   */
  public static getInstance(): ComplianceFrameworkRegistry {
    if (!ComplianceFrameworkRegistry.instance) {
      ComplianceFrameworkRegistry.instance = new ComplianceFrameworkRegistry();
    }
    return ComplianceFrameworkRegistry.instance;
  }
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Initialize with built-in frameworks
    this.loadDefaultFrameworks();
  }
  
  /**
   * Load default compliance frameworks
   */
  private loadDefaultFrameworks(): void {
    // CSRD - Corporate Sustainability Reporting Directive
    this.registerFramework(this.createCSRDFramework());
    
    // SEC Climate Disclosure Rule
    this.registerFramework(this.createSECFramework());
    
    // GHG Protocol
    this.registerFramework(this.createGHGProtocolFramework());
  }
  
  /**
   * Register a compliance framework
   */
  public registerFramework(framework: ComplianceFramework): void {
    this.frameworks.set(framework.id, framework);
  }
  
  /**
   * Get a compliance framework by ID
   */
  public getFramework(id: string): ComplianceFramework | undefined {
    return this.frameworks.get(id);
  }
  
  /**
   * Get all registered frameworks
   */
  public getAllFrameworks(): ComplianceFramework[] {
    return Array.from(this.frameworks.values());
  }
  
  /**
   * Get frameworks by region
   */
  public getFrameworksByRegion(region: string): ComplianceFramework[] {
    return this.getAllFrameworks().filter(framework => 
      framework.region.includes(region) || framework.region.includes('global')
    );
  }
  
  /**
   * Get frameworks by category
   */
  public getFrameworksByCategory(category: string): ComplianceFramework[] {
    return this.getAllFrameworks().filter(framework => 
      framework.category === category
    );
  }
  
  /**
   * Get frameworks applicable to a sector
   */
  public getFrameworksBySector(sector: string): ComplianceFramework[] {
    return this.getAllFrameworks().filter(framework => 
      framework.applicableSectors.includes(sector) || 
      framework.applicableSectors.includes('all')
    );
  }
  
  /**
   * Create the CSRD framework
   */
  private createCSRDFramework(): ComplianceFramework {
    return {
      id: 'csrd-2023',
      name: 'Corporate Sustainability Reporting Directive',
      version: '2023.1',
      description: 'EU regulation requiring companies to disclose information on environmental, social and governance factors.',
      category: 'sustainability',
      region: ['EU', 'EEA'],
      applicableSectors: ['all'],
      effectiveDate: '2024-01-01',
      lastUpdated: '2023-07-31',
      website: 'https://ec.europa.eu/info/business-economy-euro/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en',
      reportingPeriods: {
        periodType: 'annual',
        periodStartMonth: 1,
        periodStartDay: 1,
        gracePeriodDays: 90
      },
      deadlines: [
        {
          id: 'csrd-submission',
          name: 'CSRD Submission',
          description: 'Deadline for submitting the annual sustainability report',
          relativeDays: 120, // 120 days after period end
          category: 'submission'
        },
        {
          id: 'csrd-publication',
          name: 'CSRD Publication',
          description: 'Deadline for publishing the sustainability report',
          relativeDays: 150, // 150 days after period end
          category: 'publication'
        }
      ],
      requirements: [
        {
          id: 'csrd-req-1',
          name: 'Environmental impact reporting',
          description: 'Disclosure of company environmental impact including GHG emissions, energy use, and resource consumption.',
          category: 'disclosure',
          level: 'mandatory',
          evidenceTypes: ['emissions-data', 'energy-data', 'resource-data']
        },
        {
          id: 'csrd-req-2',
          name: 'Social impact reporting',
          description: 'Disclosure of company social impact including workforce conditions, diversity, and community engagement.',
          category: 'disclosure',
          level: 'mandatory',
          evidenceTypes: ['workforce-data', 'diversity-data', 'community-data']
        },
        {
          id: 'csrd-req-3',
          name: 'Governance reporting',
          description: 'Disclosure of company governance including board composition, ethical practices, and risk management.',
          category: 'disclosure',
          level: 'mandatory',
          evidenceTypes: ['board-data', 'ethics-data', 'risk-data']
        },
        {
          id: 'csrd-req-4',
          name: 'Double materiality assessment',
          description: 'Assessment of both the impact of environmental and social factors on the company and the company\'s impact on society and environment.',
          category: 'measurement',
          level: 'mandatory',
          evidenceTypes: ['materiality-assessment']
        },
        {
          id: 'csrd-req-5',
          name: 'Transition plan disclosure',
          description: 'Disclosure of transition plans towards a sustainable and climate-neutral economy.',
          category: 'disclosure',
          level: 'mandatory',
          evidenceTypes: ['transition-plan']
        }
      ]
    };
  }
  
  /**
   * Create the SEC Climate Disclosure framework
   */
  private createSECFramework(): ComplianceFramework {
    return {
      id: 'sec-climate-2023',
      name: 'SEC Climate Disclosure Rule',
      version: '2023.1',
      description: 'U.S. Securities and Exchange Commission rules requiring climate-related disclosures for investors.',
      category: 'emissions',
      region: ['US'],
      applicableSectors: ['public-companies'],
      effectiveDate: '2024-01-01',
      lastUpdated: '2023-03-15',
      website: 'https://www.sec.gov/climate-disclosure',
      reportingPeriods: {
        periodType: 'annual',
        periodStartMonth: 1,
        periodStartDay: 1,
        gracePeriodDays: 60
      },
      deadlines: [
        {
          id: 'sec-submission',
          name: 'SEC Filing',
          description: 'Deadline for filing climate disclosures with the SEC',
          relativeDays: 90, // 90 days after fiscal year end
          category: 'submission'
        }
      ],
      requirements: [
        {
          id: 'sec-req-1',
          name: 'GHG emissions disclosure',
          description: 'Disclosure of Scope 1 and Scope 2 greenhouse gas emissions, and Scope 3 emissions if material or included in targets.',
          category: 'disclosure',
          level: 'mandatory',
          evidenceTypes: ['ghg-emissions-data']
        },
        {
          id: 'sec-req-2',
          name: 'Climate-related risks',
          description: 'Disclosure of material climate-related risks and their impact on business strategy, financial planning, and outlook.',
          category: 'disclosure',
          level: 'mandatory',
          evidenceTypes: ['risk-assessment']
        },
        {
          id: 'sec-req-3',
          name: 'Climate targets and goals',
          description: 'Disclosure of climate-related targets or goals, including transition plans and progress metrics.',
          category: 'disclosure',
          level: 'mandatory',
          evidenceTypes: ['targets-data', 'transition-plan']
        },
        {
          id: 'sec-req-4',
          name: 'Climate risk governance',
          description: 'Disclosure of board and management oversight of climate-related risks.',
          category: 'disclosure',
          level: 'mandatory',
          evidenceTypes: ['governance-data']
        }
      ]
    };
  }
  
  /**
   * Create the GHG Protocol framework
   */
  private createGHGProtocolFramework(): ComplianceFramework {
    return {
      id: 'ghg-protocol',
      name: 'Greenhouse Gas Protocol',
      version: '2023.1',
      description: 'Standardized frameworks for measuring and managing greenhouse gas emissions.',
      category: 'emissions',
      region: ['global'],
      applicableSectors: ['all'],
      effectiveDate: '2001-01-01', // Original release
      lastUpdated: '2023-01-01',
      website: 'https://ghgprotocol.org/',
      reportingPeriods: {
        periodType: 'annual',
        periodStartMonth: 1,
        periodStartDay: 1,
        gracePeriodDays: 90
      },
      deadlines: [], // Voluntary standard, no specific deadlines
      requirements: [
        {
          id: 'ghg-req-1',
          name: 'Scope 1 emissions calculation',
          description: 'Calculation of direct GHG emissions from owned or controlled sources.',
          category: 'measurement',
          level: 'mandatory',
          evidenceTypes: ['emissions-data', 'calculation-methodology']
        },
        {
          id: 'ghg-req-2',
          name: 'Scope 2 emissions calculation',
          description: 'Calculation of indirect GHG emissions from purchased electricity, steam, heating, and cooling.',
          category: 'measurement',
          level: 'mandatory',
          evidenceTypes: ['emissions-data', 'calculation-methodology']
        },
        {
          id: 'ghg-req-3',
          name: 'Scope 3 emissions calculation',
          description: 'Calculation of all other indirect emissions in the value chain.',
          category: 'measurement',
          level: 'recommended',
          evidenceTypes: ['emissions-data', 'calculation-methodology']
        },
        {
          id: 'ghg-req-4',
          name: 'Base year definition',
          description: 'Selection and calculation of base year emissions for comparison.',
          category: 'measurement',
          level: 'mandatory',
          evidenceTypes: ['base-year-data']
        },
        {
          id: 'ghg-req-5',
          name: 'GHG inventory quality management',
          description: 'Implementation of quality management system for GHG inventory.',
          category: 'verification',
          level: 'recommended',
          evidenceTypes: ['quality-system-documentation']
        }
      ]
    };
  }
}
