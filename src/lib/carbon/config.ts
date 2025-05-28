/**
 * Carbon tracking and offset configuration
 */

// Cloverly API configuration
export const CLOVERLY_CONFIG = {
  apiKey: process.env.CLOVERLY_API_KEY as string,
  baseUrl: process.env.CLOVERLY_BASE_URL || 'https://api.cloverly.com/2021-03',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
};

// Default values for carbon calculations
export const CARBON_DEFAULTS = {
  // Average carbon footprint per invoice in kg CO2e
  carbonPerInvoice: 0.2,
  
  // Average carbon footprint per email in kg CO2e
  carbonPerEmail: 0.004,
  
  // Average carbon footprint per GB of data storage in kg CO2e
  carbonPerGbStorage: 0.05,
  
  // Average carbon footprint per API call in kg CO2e
  carbonPerApiCall: 0.002,
  
  // Default offset price per metric ton of CO2e in USD
  defaultOffsetPricePerTon: 10,
  
  // Minimum offset purchase amount in USD
  minimumOffsetAmount: 1.00,
  
  // Default offset location (used when no specific location is provided)
  defaultOffsetLocation: 'global',
};

// Offset project types
export enum OffsetProjectType {
  RENEWABLE_ENERGY = 'renewable_energy',
  FORESTRY = 'forestry',
  METHANE_CAPTURE = 'methane_capture',
  ENERGY_EFFICIENCY = 'energy_efficiency',
  WATER_RESTORATION = 'water_restoration',
  COMMUNITY = 'community',
}

// Offset purchase status
export enum OffsetPurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// Payment gateway options for offset purchases
export enum PaymentGateway {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  INTERNAL = 'internal', // Use existing billing system
}

// Carbon tracking metrics refresh intervals (in milliseconds)
export const CARBON_REFRESH_INTERVALS = {
  REAL_TIME: 30000, // 30 seconds
  HOURLY: 3600000, // 1 hour
  DAILY: 86400000, // 24 hours
};
