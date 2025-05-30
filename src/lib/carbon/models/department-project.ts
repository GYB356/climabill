import { Timestamp } from 'firebase/firestore';

/**
 * Interface for department data
 */
export interface Department {
  id?: string;
  name: string;
  organizationId: string;
  description?: string;
  headCount?: number;
  parentDepartmentId?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Interface for project data
 */
export interface Project {
  id?: string;
  name: string;
  organizationId: string;
  departmentId?: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  startDate: Date | Timestamp;
  endDate?: Date | Timestamp;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Interface for carbon usage data with department and project tracking
 */
export interface GranularCarbonUsage {
  id?: string;
  userId: string;
  organizationId?: string;
  departmentId?: string;
  projectId?: string;
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
 * Interface for carbon reduction goals
 */
export interface CarbonReductionGoal {
  id?: string;
  organizationId: string;
  departmentId?: string;
  projectId?: string;
  name: string;
  description?: string;
  baselineCarbonInKg: number;
  targetCarbonInKg: number;
  targetReductionPercentage: number;
  startDate: Date | Timestamp;
  targetDate: Date | Timestamp;
  status: 'active' | 'achieved' | 'missed' | 'archived';
  milestones?: Array<{
    name: string;
    targetDate: Date | Timestamp;
    targetCarbonInKg: number;
    achieved: boolean;
    achievedDate?: Date | Timestamp;
  }>;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Interface for sustainability report
 */
export interface SustainabilityReport {
  id?: string;
  organizationId: string;
  departmentId?: string;
  projectId?: string;
  reportType: 'monthly' | 'quarterly' | 'annual' | 'custom';
  name: string;
  description?: string;
  period: {
    startDate: Date | Timestamp;
    endDate: Date | Timestamp;
  };
  totalCarbonInKg: number;
  offsetCarbonInKg: number;
  remainingCarbonInKg: number;
  offsetPercentage: number;
  reductionFromPreviousPeriod?: number;
  reductionPercentage?: number;
  standards: Array<{
    name: string;
    compliant: boolean;
    details?: string;
  }>;
  generatedAt: Date | Timestamp;
  reportUrl?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Enum for carbon accounting standards
 */
export enum CarbonAccountingStandard {
  GHG_PROTOCOL = 'ghg_protocol',
  ISO_14064 = 'iso_14064',
  PAS_2060 = 'pas_2060',
  TCFD = 'tcfd',
  CDP = 'cdp',
  SCIENCE_BASED_TARGETS = 'science_based_targets',
}

/**
 * Interface for carbon accounting standard compliance
 */
export interface StandardCompliance {
  id?: string;
  organizationId: string;
  standard: CarbonAccountingStandard;
  compliant: boolean;
  lastVerificationDate?: Date | Timestamp;
  nextVerificationDate?: Date | Timestamp;
  verificationBody?: string;
  certificateUrl?: string;
  notes?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}
