/**
 * Types for Industry Benchmarking
 */

export enum Industry {
  TECHNOLOGY = 'technology',
  FINANCE = 'finance',
  HEALTHCARE = 'healthcare',
  MANUFACTURING = 'manufacturing',
  RETAIL = 'retail',
  ENERGY = 'energy',
  TRANSPORTATION = 'transportation',
  HOSPITALITY = 'hospitality',
  EDUCATION = 'education',
  PROFESSIONAL_SERVICES = 'professional_services'
}

export enum CompanySize {
  SMALL = 'small', // 1-50 employees
  MEDIUM = 'medium', // 51-500 employees
  LARGE = 'large', // 501-5000 employees
  ENTERPRISE = 'enterprise' // 5000+ employees
}

export enum MetricType {
  CARBON_EMISSIONS = 'carbon_emissions',
  ENERGY_USAGE = 'energy_usage',
  WATER_USAGE = 'water_usage',
  WASTE_GENERATED = 'waste_generated',
  RENEWABLE_ENERGY_PERCENTAGE = 'renewable_energy_percentage'
}

export interface BenchmarkMetric {
  metricType: MetricType;
  value: number;
  unit: string;
  percentile: number; // 0-100, where 100 is best in industry
  industryAverage: number;
  industryBest: number;
  industryWorst: number;
}

export interface BenchmarkResult {
  organizationId: string;
  industryId: Industry;
  companySize: CompanySize;
  metrics: BenchmarkMetric[];
  timestamp: Date;
}

export interface SharingPreferences {
  shareAnonymousData: boolean;
  shareMetrics: MetricType[];
  shareIndustryInfo: boolean;
  shareCompanySize: boolean;
}

export interface BestPractice {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  metrics: MetricType[];
  industryId: Industry;
  caseStudies: CaseStudy[];
}

export interface CaseStudy {
  id: string;
  companyName: string;
  description: string;
  results: string;
  implementationTime: string;
  roi: string;
}
