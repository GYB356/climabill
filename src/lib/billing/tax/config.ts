/**
 * Tax service configuration
 */

// TaxJar API credentials
export const TAXJAR_CONFIG = {
  apiKey: process.env.TAXJAR_API_KEY as string,
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.taxjar.com/v2' 
    : 'https://api.sandbox.taxjar.com/v2',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
};

// Company information for tax calculations
export const COMPANY_INFO = {
  name: 'ClimaBill Inc.',
  fromCountry: 'US',
  fromZip: process.env.COMPANY_ZIP_CODE || '94107',
  fromState: process.env.COMPANY_STATE || 'CA',
  fromCity: process.env.COMPANY_CITY || 'San Francisco',
  fromStreet: process.env.COMPANY_STREET || '123 Main St',
};

// Tax exemption categories
export const TAX_EXEMPTION_TYPES = [
  { value: 'government', label: 'Government Entity' },
  { value: 'education', label: 'Educational Institution' },
  { value: 'nonprofit', label: 'Non-Profit Organization' },
  { value: 'wholesale', label: 'Wholesale/Reseller' },
  { value: 'other', label: 'Other' },
];
