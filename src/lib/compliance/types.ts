import { ConsentType, ConsentStatus } from '@prisma/client';

/**
 * Represents a complete export of user data for GDPR/CCPA compliance
 */
export interface UserDataExport {
  personalInformation: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
  customers: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  invoices: {
    id: string;
    number: string;
    amount: number;
    status: string;
    createdAt: Date;
    items: {
      id: string;
      description: string;
      quantity: number;
      unitPrice: number;
    }[];
    payments: {
      id: string;
      amount: number;
      method: string;
      date: Date;
    }[];
  }[];
  carbonData: {
    usage: {
      id: string;
      source: string;
      amount: number;
      date: Date;
    }[];
    offsets: {
      id: string;
      provider: string;
      amount: number;
      date: Date;
      certificate: string;
    }[];
  };
  wallets: {
    id: string;
    name: string;
    address: string;
    network: string;
    createdAt: Date;
  }[];
  integrations: {
    id: string;
    provider: string;
    status: string;
    createdAt: Date;
  }[];
  consents: {
    id: string;
    type: ConsentType;
    status: ConsentStatus;
    createdAt: Date;
    updatedAt: Date;
    history: {
      id: string;
      status: ConsentStatus;
      source: string;
      ipAddress: string;
      userAgent: string;
      createdAt: Date;
    }[];
  }[];
}

/**
 * Data retention policy configuration
 */
export interface DataRetentionPolicy {
  dataType: string;
  retentionPeriod: number; // in days
  legalBasis: string;
  automaticDeletion: boolean;
}

/**
 * Cookie categories for consent management
 */
export enum CookieCategory {
  NECESSARY = 'necessary',
  PREFERENCES = 'preferences',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing'
}

/**
 * Cookie definition for consent banner
 */
export interface CookieDefinition {
  name: string;
  domain: string;
  category: CookieCategory;
  description: string;
  duration: string;
  provider: string;
}

/**
 * Data breach notification details
 */
export interface DataBreachNotification {
  breachId: string;
  description: string;
  discoveryDate: Date;
  affectedUsers: string[];
  dataCategories: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  notificationDate: Date;
  remediation: string;
}

/**
 * Data processing record for GDPR Article 30 compliance
 */
export interface DataProcessingRecord {
  id: string;
  processName: string;
  purpose: string;
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  thirdCountryTransfers: boolean;
  securityMeasures: string[];
  retentionPeriod: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data subject rights request
 */
export interface DataSubjectRequest {
  id: string;
  userId: string;
  requestType: 'ACCESS' | 'RECTIFICATION' | 'ERASURE' | 'RESTRICTION' | 'PORTABILITY' | 'OBJECTION';
  details: string;
  status: 'RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'DENIED';
  createdAt: Date;
  completedAt?: Date;
  notes?: string;
}

/**
 * Data protection impact assessment
 */
export interface DataProtectionImpactAssessment {
  id: string;
  processName: string;
  description: string;
  necessity: string;
  proportionality: string;
  risks: {
    description: string;
    likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    mitigations: string[];
  }[];
  consultationRequired: boolean;
  approvedBy?: string;
  approvedDate?: Date;
  reviewDate: Date;
}

/**
 * Vendor assessment for data processors
 */
export interface VendorAssessment {
  id: string;
  vendorName: string;
  services: string[];
  dataCategories: string[];
  processingLocations: string[];
  securityMeasures: string[];
  contractDate: Date;
  dpaInPlace: boolean;
  subProcessors: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  approvedBy: string;
  approvedDate: Date;
  reviewDate: Date;
}
