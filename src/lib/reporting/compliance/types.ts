/**
 * Types for Compliance Reporting
 */

export enum ComplianceFramework {
  GHG_PROTOCOL = 'ghg_protocol',
  TCFD = 'tcfd',
  CDP = 'cdp',
  SASB = 'sasb',
  GRI = 'gri',
  EU_CSRD = 'eu_csrd',
  SFDR = 'sfdr',
  SECR = 'secr'
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
  HTML = 'html'
}

export enum ReportFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUALLY = 'semi_annually',
  ANNUALLY = 'annually',
  CUSTOM = 'custom'
}

export enum ValidationStatus {
  VALID = 'valid',
  WARNING = 'warning',
  ERROR = 'error',
  NOT_VALIDATED = 'not_validated'
}

export interface ReportSection {
  id: string;
  title: string;
  required: boolean;
  dataPoints: string[];
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  id: string;
  description: string;
  severity: 'error' | 'warning';
  validationFn: string; // Serialized function or reference to validation function
}

export interface ValidationResult {
  organizationId: string;
  framework: ComplianceFramework;
  timestamp: Date;
  status: ValidationStatus;
  issues: ValidationIssue[];
  completeness: number; // Percentage of required data that is available
}

export interface ValidationIssue {
  sectionId: string;
  dataPoint: string;
  severity: 'error' | 'warning';
  message: string;
  recommendation?: string;
}

export interface ReportSchedule {
  id: string;
  organizationId: string;
  framework: ComplianceFramework;
  frequency: ReportFrequency;
  format: ReportFormat;
  recipients: string[]; // Email addresses
  nextRunDate: Date;
  customSchedule?: {
    months?: number[];
    dayOfMonth?: number;
  };
  enabled: boolean;
}

export interface ScheduleResult {
  scheduleId: string;
  nextRunDate: Date;
  message: string;
}

export interface ComplianceReport {
  id: string;
  organizationId: string;
  framework: ComplianceFramework;
  period: {
    startDate: Date;
    endDate: Date;
  };
  generatedAt: Date;
  format: ReportFormat;
  fileUrl: string;
  sections: ReportSectionData[];
  validationStatus: ValidationStatus;
  validationIssues: ValidationIssue[];
}

export interface ReportSectionData {
  id: string;
  title: string;
  data: Record<string, any>;
  charts?: ReportChart[];
  tables?: ReportTable[];
}

export interface ReportChart {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  data: any[];
}

export interface ReportTable {
  id: string;
  title: string;
  headers: string[];
  rows: any[][];
}
