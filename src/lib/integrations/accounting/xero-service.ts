import axios from 'axios';
import { OAuthService } from '../oauth/oauth-service';
import { OAuthProvider, OAUTH_CONFIG } from '../oauth/config';

/**
 * Interface for Xero contact
 */
export interface XeroContact {
  ContactID?: string;
  Name: string;
  EmailAddress?: string;
  Phones?: Array<{
    PhoneType: 'DEFAULT' | 'DDI' | 'MOBILE' | 'FAX';
    PhoneNumber: string;
  }>;
  Addresses?: Array<{
    AddressType: 'POBOX' | 'STREET' | 'DELIVERY';
    AddressLine1?: string;
    AddressLine2?: string;
    City?: string;
    Region?: string;
    PostalCode?: string;
    Country?: string;
  }>;
  IsCustomer?: boolean;
  IsSupplier?: boolean;
}

/**
 * Interface for Xero invoice
 */
export interface XeroInvoice {
  InvoiceID?: string;
  Type: 'ACCREC' | 'ACCPAY';
  Contact: {
    ContactID: string;
  };
  Date: string;
  DueDate: string;
  LineItems: Array<{
    Description: string;
    Quantity: number;
    UnitAmount: number;
    AccountCode: string;
    TaxType?: string;
    LineAmount?: number;
  }>;
  Status?: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID' | 'VOIDED';
  InvoiceNumber?: string;
  Reference?: string;
  CurrencyCode?: string;
}

/**
 * Interface for Xero payment
 */
export interface XeroPayment {
  PaymentID?: string;
  Invoice: {
    InvoiceID: string;
  };
  Account: {
    AccountID: string;
  };
  Date: string;
  Amount: number;
  Reference?: string;
  PaymentType?: 'ACCRECPAYMENT' | 'ACCPAYPAYMENT';
}

/**
 * Interface for Xero account
 */
export interface XeroAccount {
  AccountID: string;
  Code: string;
  Name: string;
  Type: string;
  TaxType?: string;
  Description?: string;
  EnablePaymentsToAccount?: boolean;
  ShowInExpenseClaims?: boolean;
  Class?: string;
  Status?: string;
}

/**
 * Service for interacting with Xero API
 */
export class XeroService {
  private oauthService: OAuthService;
  private apiBase: string;
  
  constructor() {
    this.oauthService = new OAuthService();
    this.apiBase = OAUTH_CONFIG[OAuthProvider.XERO].apiBase;
  }
  
  /**
   * Make a request to the Xero API
   * @param userId User ID
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param data Request data
   * @param organizationId Optional organization ID
   * @returns Response data
   */
  private async makeRequest<T>(
    userId: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    organizationId?: string
  ): Promise<T> {
    try {
      // Get access token
      const accessToken = await this.oauthService.getAccessToken(
        userId,
        OAuthProvider.XERO,
        organizationId
      );
      
      if (!accessToken) {
        throw new Error('Xero integration not connected');
      }
      
      // Get integration data
      const integration = await this.oauthService.getIntegration(
        userId,
        OAuthProvider.XERO,
        organizationId
      );
      
      if (!integration || !integration.providerTenantId) {
        throw new Error('Xero tenant ID not found');
      }
      
      const tenantId = integration.providerTenantId;
      
      // Make API request
      const response = await axios({
        method,
        url: `${this.apiBase}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Xero-Tenant-Id': tenantId,
        },
        data,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error making Xero API request:', error);
      throw error;
    }
  }
  
  /**
   * Create a contact in Xero
   * @param userId User ID
   * @param contact Contact data
   * @param organizationId Optional organization ID
   * @returns Created contact
   */
  async createContact(
    userId: string,
    contact: XeroContact,
    organizationId?: string
  ): Promise<XeroContact> {
    try {
      const response = await this.makeRequest<{ Contacts: XeroContact[] }>(
        userId,
        'POST',
        '/Contacts',
        { Contacts: [contact] },
        organizationId
      );
      
      return response.Contacts[0];
    } catch (error) {
      console.error('Error creating Xero contact:', error);
      throw error;
    }
  }
  
  /**
   * Get a contact from Xero by ID
   * @param userId User ID
   * @param contactId Xero contact ID
   * @param organizationId Optional organization ID
   * @returns Contact data
   */
  async getContact(
    userId: string,
    contactId: string,
    organizationId?: string
  ): Promise<XeroContact> {
    try {
      const response = await this.makeRequest<{ Contacts: XeroContact[] }>(
        userId,
        'GET',
        `/Contacts/${contactId}`,
        undefined,
        organizationId
      );
      
      return response.Contacts[0];
    } catch (error) {
      console.error('Error getting Xero contact:', error);
      throw error;
    }
  }
  
  /**
   * Find a contact in Xero by name
   * @param userId User ID
   * @param name Contact name
   * @param organizationId Optional organization ID
   * @returns Contact data or null if not found
   */
  async findContactByName(
    userId: string,
    name: string,
    organizationId?: string
  ): Promise<XeroContact | null> {
    try {
      const response = await this.makeRequest<{ Contacts: XeroContact[] }>(
        userId,
        'GET',
        `/Contacts?where=Name="${encodeURIComponent(name)}"`,
        undefined,
        organizationId
      );
      
      if (!response.Contacts || response.Contacts.length === 0) {
        return null;
      }
      
      return response.Contacts[0];
    } catch (error) {
      console.error('Error finding Xero contact by name:', error);
      throw error;
    }
  }
  
  /**
   * Create an invoice in Xero
   * @param userId User ID
   * @param invoice Invoice data
   * @param organizationId Optional organization ID
   * @returns Created invoice
   */
  async createInvoice(
    userId: string,
    invoice: XeroInvoice,
    organizationId?: string
  ): Promise<XeroInvoice> {
    try {
      const response = await this.makeRequest<{ Invoices: XeroInvoice[] }>(
        userId,
        'POST',
        '/Invoices',
        { Invoices: [invoice] },
        organizationId
      );
      
      return response.Invoices[0];
    } catch (error) {
      console.error('Error creating Xero invoice:', error);
      throw error;
    }
  }
  
  /**
   * Get an invoice from Xero by ID
   * @param userId User ID
   * @param invoiceId Xero invoice ID
   * @param organizationId Optional organization ID
   * @returns Invoice data
   */
  async getInvoice(
    userId: string,
    invoiceId: string,
    organizationId?: string
  ): Promise<XeroInvoice> {
    try {
      const response = await this.makeRequest<{ Invoices: XeroInvoice[] }>(
        userId,
        'GET',
        `/Invoices/${invoiceId}`,
        undefined,
        organizationId
      );
      
      return response.Invoices[0];
    } catch (error) {
      console.error('Error getting Xero invoice:', error);
      throw error;
    }
  }
  
  /**
   * Create a payment in Xero
   * @param userId User ID
   * @param payment Payment data
   * @param organizationId Optional organization ID
   * @returns Created payment
   */
  async createPayment(
    userId: string,
    payment: XeroPayment,
    organizationId?: string
  ): Promise<XeroPayment> {
    try {
      const response = await this.makeRequest<{ Payments: XeroPayment[] }>(
        userId,
        'POST',
        '/Payments',
        { Payments: [payment] },
        organizationId
      );
      
      return response.Payments[0];
    } catch (error) {
      console.error('Error creating Xero payment:', error);
      throw error;
    }
  }
  
  /**
   * Get accounts from Xero
   * @param userId User ID
   * @param organizationId Optional organization ID
   * @returns List of accounts
   */
  async getAccounts(
    userId: string,
    organizationId?: string
  ): Promise<XeroAccount[]> {
    try {
      const response = await this.makeRequest<{ Accounts: XeroAccount[] }>(
        userId,
        'GET',
        '/Accounts',
        undefined,
        organizationId
      );
      
      return response.Accounts;
    } catch (error) {
      console.error('Error getting Xero accounts:', error);
      throw error;
    }
  }
  
  /**
   * Get revenue accounts from Xero
   * @param userId User ID
   * @param organizationId Optional organization ID
   * @returns List of revenue accounts
   */
  async getRevenueAccounts(
    userId: string,
    organizationId?: string
  ): Promise<XeroAccount[]> {
    try {
      const accounts = await this.getAccounts(userId, organizationId);
      return accounts.filter(account => account.Type === 'REVENUE' || account.Type === 'SALES');
    } catch (error) {
      console.error('Error getting Xero revenue accounts:', error);
      throw error;
    }
  }
  
  /**
   * Get bank accounts from Xero
   * @param userId User ID
   * @param organizationId Optional organization ID
   * @returns List of bank accounts
   */
  async getBankAccounts(
    userId: string,
    organizationId?: string
  ): Promise<XeroAccount[]> {
    try {
      const accounts = await this.getAccounts(userId, organizationId);
      return accounts.filter(account => account.Type === 'BANK');
    } catch (error) {
      console.error('Error getting Xero bank accounts:', error);
      throw error;
    }
  }
  
  /**
   * Sync a ClimaBill customer to Xero
   * @param userId User ID
   * @param customer ClimaBill customer data
   * @param organizationId Optional organization ID
   * @returns Xero contact ID
   */
  async syncCustomer(
    userId: string,
    customer: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      };
    },
    organizationId?: string
  ): Promise<string> {
    try {
      // Check if customer already exists in Xero
      const existingContact = await this.findContactByName(userId, customer.name, organizationId);
      
      if (existingContact) {
        return existingContact.ContactID as string;
      }
      
      // Create contact in Xero
      const xeroContact: XeroContact = {
        Name: customer.name,
        EmailAddress: customer.email,
        IsCustomer: true,
      };
      
      if (customer.phone) {
        xeroContact.Phones = [
          {
            PhoneType: 'DEFAULT',
            PhoneNumber: customer.phone,
          },
        ];
      }
      
      if (customer.address) {
        xeroContact.Addresses = [
          {
            AddressType: 'STREET',
            AddressLine1: customer.address.line1,
            AddressLine2: customer.address.line2,
            City: customer.address.city,
            Region: customer.address.state,
            PostalCode: customer.address.postalCode,
            Country: customer.address.country,
          },
        ];
      }
      
      const createdContact = await this.createContact(userId, xeroContact, organizationId);
      
      return createdContact.ContactID as string;
    } catch (error) {
      console.error('Error syncing customer to Xero:', error);
      throw error;
    }
  }
  
  /**
   * Sync a ClimaBill invoice to Xero
   * @param userId User ID
   * @param invoice ClimaBill invoice data
   * @param xeroContactId Xero contact ID
   * @param organizationId Optional organization ID
   * @returns Xero invoice ID
   */
  async syncInvoice(
    userId: string,
    invoice: {
      id: string;
      number: string;
      date: string;
      dueDate: string;
      items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        amount: number;
      }>;
      currencyCode?: string;
      reference?: string;
    },
    xeroContactId: string,
    organizationId?: string
  ): Promise<string> {
    try {
      // Get revenue accounts
      const revenueAccounts = await this.getRevenueAccounts(userId, organizationId);
      
      if (revenueAccounts.length === 0) {
        throw new Error('No revenue accounts found in Xero');
      }
      
      // Default revenue account
      const defaultRevenueAccount = revenueAccounts[0];
      
      // Create invoice in Xero
      const xeroInvoice: XeroInvoice = {
        Type: 'ACCREC',
        Contact: {
          ContactID: xeroContactId,
        },
        Date: invoice.date,
        DueDate: invoice.dueDate,
        LineItems: invoice.items.map(item => ({
          Description: item.description,
          Quantity: item.quantity,
          UnitAmount: item.unitPrice,
          AccountCode: defaultRevenueAccount.Code,
          LineAmount: item.amount,
        })),
        Status: 'AUTHORISED',
        InvoiceNumber: invoice.number,
        Reference: invoice.reference,
        CurrencyCode: invoice.currencyCode,
      };
      
      const createdInvoice = await this.createInvoice(userId, xeroInvoice, organizationId);
      
      return createdInvoice.InvoiceID as string;
    } catch (error) {
      console.error('Error syncing invoice to Xero:', error);
      throw error;
    }
  }
  
  /**
   * Sync a ClimaBill payment to Xero
   * @param userId User ID
   * @param payment ClimaBill payment data
   * @param xeroInvoiceId Xero invoice ID
   * @param organizationId Optional organization ID
   * @returns Xero payment ID
   */
  async syncPayment(
    userId: string,
    payment: {
      id: string;
      date: string;
      amount: number;
      reference?: string;
    },
    xeroInvoiceId: string,
    organizationId?: string
  ): Promise<string> {
    try {
      // Get bank accounts
      const bankAccounts = await this.getBankAccounts(userId, organizationId);
      
      if (bankAccounts.length === 0) {
        throw new Error('No bank accounts found in Xero');
      }
      
      // Default bank account
      const defaultBankAccount = bankAccounts[0];
      
      // Create payment in Xero
      const xeroPayment: XeroPayment = {
        Invoice: {
          InvoiceID: xeroInvoiceId,
        },
        Account: {
          AccountID: defaultBankAccount.AccountID,
        },
        Date: payment.date,
        Amount: payment.amount,
        Reference: payment.reference,
        PaymentType: 'ACCRECPAYMENT',
      };
      
      const createdPayment = await this.createPayment(userId, xeroPayment, organizationId);
      
      return createdPayment.PaymentID as string;
    } catch (error) {
      console.error('Error syncing payment to Xero:', error);
      throw error;
    }
  }
  
  /**
   * Get organization information from Xero
   * @param userId User ID
   * @param organizationId Optional organization ID
   * @returns Organization information
   */
  async getOrganization(
    userId: string,
    organizationId?: string
  ): Promise<any> {
    try {
      const response = await this.makeRequest<{ Organisations: any[] }>(
        userId,
        'GET',
        '/Organisation',
        undefined,
        organizationId
      );
      
      return response.Organisations[0];
    } catch (error) {
      console.error('Error getting Xero organization:', error);
      throw error;
    }
  }
}
