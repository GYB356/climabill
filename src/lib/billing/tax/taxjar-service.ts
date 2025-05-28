import Taxjar from 'taxjar';
import { TAXJAR_CONFIG, COMPANY_INFO } from './config';

// Initialize TaxJar client
const taxjarClient = new Taxjar({
  apiKey: TAXJAR_CONFIG.apiKey,
  apiUrl: TAXJAR_CONFIG.apiUrl,
});

/**
 * Service for handling tax calculations and reporting using TaxJar
 */
export class TaxService {
  /**
   * Calculate sales tax for an order
   * @param params Order parameters
   * @returns Tax calculation result
   */
  static async calculateTax(params: {
    toCountry: string;
    toZip: string;
    toState: string;
    toCity?: string;
    toStreet?: string;
    amount: number;
    shipping?: number;
    customerId?: string;
    exemptionType?: string;
  }) {
    try {
      const { 
        toCountry, 
        toZip, 
        toState, 
        toCity, 
        toStreet, 
        amount, 
        shipping = 0,
        customerId,
        exemptionType
      } = params;

      const taxParams: any = {
        from_country: COMPANY_INFO.fromCountry,
        from_zip: COMPANY_INFO.fromZip,
        from_state: COMPANY_INFO.fromState,
        from_city: COMPANY_INFO.fromCity,
        from_street: COMPANY_INFO.fromStreet,
        to_country: toCountry,
        to_zip: toZip,
        to_state: toState,
        amount,
        shipping,
      };

      // Add optional parameters if provided
      if (toCity) taxParams.to_city = toCity;
      if (toStreet) taxParams.to_street = toStreet;
      if (customerId) taxParams.customer_id = customerId;
      if (exemptionType) taxParams.exemption_type = exemptionType;

      const taxData = await taxjarClient.taxForOrder(taxParams);
      return taxData;
    } catch (error) {
      console.error('Error calculating tax:', error);
      throw error;
    }
  }

  /**
   * Create a new order transaction for tax reporting
   * @param params Order parameters
   * @returns Created order
   */
  static async createOrder(params: {
    transactionId: string;
    transactionDate: string;
    toCountry: string;
    toZip: string;
    toState: string;
    toCity?: string;
    toStreet?: string;
    amount: number;
    shipping?: number;
    salesTax: number;
    customerId?: string;
    exemptionType?: string;
    lineItems?: Array<{
      id: string;
      quantity: number;
      productTaxCode?: string;
      unitPrice: number;
      discount?: number;
    }>;
  }) {
    try {
      const {
        transactionId,
        transactionDate,
        toCountry,
        toZip,
        toState,
        toCity,
        toStreet,
        amount,
        shipping = 0,
        salesTax,
        customerId,
        exemptionType,
        lineItems = [],
      } = params;

      const orderParams: any = {
        transaction_id: transactionId,
        transaction_date: transactionDate,
        from_country: COMPANY_INFO.fromCountry,
        from_zip: COMPANY_INFO.fromZip,
        from_state: COMPANY_INFO.fromState,
        from_city: COMPANY_INFO.fromCity,
        from_street: COMPANY_INFO.fromStreet,
        to_country: toCountry,
        to_zip: toZip,
        to_state: toState,
        amount,
        shipping,
        sales_tax: salesTax,
        line_items: lineItems,
      };

      // Add optional parameters if provided
      if (toCity) orderParams.to_city = toCity;
      if (toStreet) orderParams.to_street = toStreet;
      if (customerId) orderParams.customer_id = customerId;
      if (exemptionType) orderParams.exemption_type = exemptionType;

      const order = await taxjarClient.createOrder(orderParams);
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Update an existing order transaction
   * @param params Order parameters
   * @returns Updated order
   */
  static async updateOrder(params: {
    transactionId: string;
    transactionDate: string;
    toCountry: string;
    toZip: string;
    toState: string;
    toCity?: string;
    toStreet?: string;
    amount: number;
    shipping?: number;
    salesTax: number;
    customerId?: string;
    exemptionType?: string;
    lineItems?: Array<{
      id: string;
      quantity: number;
      productTaxCode?: string;
      unitPrice: number;
      discount?: number;
    }>;
  }) {
    try {
      const {
        transactionId,
        transactionDate,
        toCountry,
        toZip,
        toState,
        toCity,
        toStreet,
        amount,
        shipping = 0,
        salesTax,
        customerId,
        exemptionType,
        lineItems = [],
      } = params;

      const orderParams: any = {
        transaction_id: transactionId,
        transaction_date: transactionDate,
        from_country: COMPANY_INFO.fromCountry,
        from_zip: COMPANY_INFO.fromZip,
        from_state: COMPANY_INFO.fromState,
        from_city: COMPANY_INFO.fromCity,
        from_street: COMPANY_INFO.fromStreet,
        to_country: toCountry,
        to_zip: toZip,
        to_state: toState,
        amount,
        shipping,
        sales_tax: salesTax,
        line_items: lineItems,
      };

      // Add optional parameters if provided
      if (toCity) orderParams.to_city = toCity;
      if (toStreet) orderParams.to_street = toStreet;
      if (customerId) orderParams.customer_id = customerId;
      if (exemptionType) orderParams.exemption_type = exemptionType;

      const order = await taxjarClient.updateOrder(orderParams);
      return order;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  /**
   * Delete an order transaction
   * @param transactionId Order transaction ID
   * @returns Deletion result
   */
  static async deleteOrder(transactionId: string) {
    try {
      const result = await taxjarClient.deleteOrder(transactionId);
      return result;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  /**
   * Get tax rates for a location
   * @param params Location parameters
   * @returns Tax rates
   */
  static async getTaxRates(params: {
    zip: string;
    country?: string;
    state?: string;
    city?: string;
    street?: string;
  }) {
    try {
      const { zip, country, state, city, street } = params;

      const rateParams: any = { zip };
      if (country) rateParams.country = country;
      if (state) rateParams.state = state;
      if (city) rateParams.city = city;
      if (street) rateParams.street = street;

      const rates = await taxjarClient.ratesForLocation(zip, rateParams);
      return rates;
    } catch (error) {
      console.error('Error getting tax rates:', error);
      throw error;
    }
  }

  /**
   * Validate a VAT number
   * @param vatNumber VAT number to validate
   * @returns Validation result
   */
  static async validateVat(vatNumber: string) {
    try {
      const validation = await taxjarClient.validateVat(vatNumber);
      return validation;
    } catch (error) {
      console.error('Error validating VAT:', error);
      throw error;
    }
  }

  /**
   * List tax categories
   * @returns List of tax categories
   */
  static async listTaxCategories() {
    try {
      const categories = await taxjarClient.categories();
      return categories;
    } catch (error) {
      console.error('Error listing tax categories:', error);
      throw error;
    }
  }
}
