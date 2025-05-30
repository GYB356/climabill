// Carbon management types

// Carbon Reduction Goal
export interface CarbonReductionGoal {
  id: string;
  title: string;
  description: string;
  baselineValue: number;
  targetValue: number;
  baselineDate: Date;
  targetDate: Date;
  departmentId?: string;
  projectId?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Carbon Usage Data
export interface CarbonUsageData {
  totalEmissions: number;
  breakdown: EmissionsSourceData[];
}

// Emissions Source Data
export interface EmissionsSourceData {
  source: string;
  emissions: number;
  percentage: number;
}

// Emissions Time Series Data
export interface EmissionsTimeSeriesData {
  date: Date;
  totalEmissions: number;
  sources: Record<string, number>;
}

// Carbon Offset Project
export interface OffsetProject {
  id: string;
  name: string;
  description: string;
  costPerTon: number;
  location: string;
  type: string;
  verified: boolean;
  verificationStandard?: string;
}

// Carbon Offset Purchase
export interface OffsetPurchase {
  id: string;
  amount: number;
  cost: number;
  date: Date;
  projectId: string;
  projectName: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
}

// Offset Donation
export interface OffsetDonation {
  id: string;
  name: string;
  description: string;
  minimumAmount: number;
  suggestedAmounts: number[];
  currency: string;
}

// Department
export interface Department {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Project
export interface Project {
  id: string;
  name: string;
  description?: string;
  departmentId?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Standards Compliance
export interface StandardsCompliance {
  id: string;
  standardName: string;
  complianceLevel: 'full' | 'partial' | 'none';
  verificationDate?: Date;
  verificationBody?: string;
  certificateId?: string;
  expiryDate?: Date;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sustainability Report
export interface SustainabilityReport {
  id: string;
  title: string;
  description?: string;
  reportingPeriodStart: Date;
  reportingPeriodEnd: Date;
  standards: string[];
  status: 'draft' | 'published';
  downloadUrl?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}
