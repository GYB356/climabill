/**
 * Types for Carbon Marketplace
 */

export enum CreditType {
  RENEWABLE_ENERGY = 'renewable_energy',
  REFORESTATION = 'reforestation',
  METHANE_CAPTURE = 'methane_capture',
  ENERGY_EFFICIENCY = 'energy_efficiency',
  BLUE_CARBON = 'blue_carbon'
}

export enum VerificationStandard {
  VERRA = 'verra',
  GOLD_STANDARD = 'gold_standard',
  CLIMATE_ACTION_RESERVE = 'climate_action_reserve',
  AMERICAN_CARBON_REGISTRY = 'american_carbon_registry',
  PLAN_VIVO = 'plan_vivo'
}

export interface CarbonCredit {
  id: string;
  projectId: string;
  projectName: string;
  creditType: CreditType;
  quantity: number;
  vintage: string;
  price: number;
  verificationStandard: VerificationStandard;
  location: string;
  description: string;
  imageUrl: string;
  isVerified: boolean;
  verificationId?: string;
}

export interface CreditFilters {
  creditType?: CreditType;
  verificationStandard?: VerificationStandard;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  vintage?: string;
}

export interface PurchaseResult {
  transactionId: string;
  creditId: string;
  quantity: number;
  totalPrice: number;
  timestamp: Date;
  verificationId?: string;
}

export interface UserPortfolio {
  userId: string;
  totalCredits: number;
  totalCarbonOffset: number;
  credits: CarbonCredit[];
  retiredCredits: CarbonCredit[];
}

export interface RetirementResult {
  retirementId: string;
  creditIds: string[];
  totalCarbonOffset: number;
  timestamp: Date;
  certificateUrl: string;
}
