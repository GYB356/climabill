import axios from 'axios';
import { OAuthService } from '../oauth/oauth-service';
import { OAuthProvider, OAUTH_CONFIG } from '../oauth/config';

/**
 * Interface for QuickBooks customer
 */
export interface QuickBooksCustomer {
  Id?: string;
  DisplayName: string;
  PrimaryEmailAddr?: {
    Address: string;
  };
  PrimaryPhone?: {
    FreeFormNumber: string;
  };
  CompanyName?: string;
  BillAddr?: {
    Line1?: string;
    Line2?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
    Country?: string;
  };
}

/**
 * Interface for QuickBooks invoice
 */
export interface QuickBooksInvoice {
  Id?: string;
  CustomerRef: {
    value: string;
  };
  TxnDate: string;
  DueDate: string;
  Line: Array<{
    DetailType: 'SalesItemLineDetail';
    Amount: number;
    Description?: string;
    SalesItemLineDetail: {
      ItemRef: {
        value: string;
      };
      Qty?: number;
      UnitPrice?: number;
    };
  }>;
  TotalAmt?: number;
  DocNumber?: string;
  PrivateNote?: string;
}

/**
 * Interface for QuickBooks item
 */
export interface QuickBooksItem {
  Id?: string;
  Name: string;
  Description?: string;
  Type: 'Service' | 'Inventory' | 'NonInventory';
  IncomeAccountRef: {
    value: string;
  };
  UnitPrice?: number;
  Taxable?: boolean;
}

/**
 * Interface for QuickBooks payment
 */
export interface QuickBooksPayment {
  Id?: string;
  CustomerRef: {
    value: string;
  };
  TxnDate: string;
  TotalAmt: number;
  Line: Array<{
    Amount: number;
    LinkedTxn: Array<{
      TxnId: string;
      TxnType: 'Invoice';
    }>;
  }>;
  PaymentMethodRef?: {
    value: string;
  };
  PrivateNote?: string;
}

/**
 * Service for interacting with QuickBooks API
 */
export class QuickBooksService {
  private oauthService: OAuthService;
  private apiBase: string;
  
  constructor() {
    this.oauthService = new OAuthService();
    this.apiBase = OAUTH_CONFIG[OAuthProvider.QUICKBOOKS].apiBase;
  }
  
  /**
   * Make a request to the QuickBooks API
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
        OAuthProvider.QUICKBOOKS,
        organizationId
      );
      
      if (!accessToken) {
        throw new Error('QuickBooks integration not connected');
      }
      
      // Get integration data
      const integration = await this.oauthService.getIntegration(
        userId,
        OAuthProvider.QUICKBOOKS,
        organizationId
      );
      
      if (!integration || !integration.providerTenantId) {
        throw new Error('QuickBooks company ID not found');
      }
      
      const companyId = integration.providerTenantId;
      
      // Make API request
      const response = await axios({
        method,
        url: `${this.apiBase}/company/${companyId}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        data: data ? JSON.stringify(data) : undefined,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error making QuickBooks API request:', error);
      throw error;
    }
  }
  
  /**
   * Create a customer in QuickBooks
   * @param userId User ID
   * @param customer Customer data
   * @param organizationId Optional organization ID
   * @returns Created customer
   */
  async createCustomer(
    userId: string,
    customer: QuickBooksCustomer,
    organizationId?: string
  ): Promise<QuickBooksCustomer> {
    try {
      const response = await this.makeRequest<{ Customer: QuickBooksCustomer }>(
        userId,
        'POST',
        '/customer',
        customer,
        organizationId
      );
      
      return response.Customer;
    } catch (error) {
      console.error('Error creating QuickBooks customer:', error);
      throw error;
    }
  }
  
  /**
   * Get a customer from QuickBooks by ID
   * @param userId User ID
   * @param customerId QuickBooks customer ID
   * @param organizationId Optional organization ID
   * @returns Customer data
   */
  async getCustomer(
    userId: string,
    customerId: string,
    organizationId?: string
  ): Promise<QuickBooksCustomer> {
    try {
      const response = await this.makeRequest<{ Customer: QuickBooksCustomer }>(
        userId,
        'GET',
        `/customer/${customerId}`,
        undefined,
        organizationId
      );
      
      return response.Customer;
    } catch (error) {
      console.error('Error getting QuickBooks customer:', error);
      throw error;
    }
  }
  
  /**
   * Find a customer in QuickBooks by display name
   * @param userId User ID
   * @param displayName Customer display name
   * @param organizationId Optional organization ID
   * @returns Customer data or null if not found
   */
  async findCustomerByName(
    userId: string,
    displayName: string,
    organizationId?: string
  ): Promise<QuickBooksCustomer | null> {
    try {
      const query = `SELECT * FROM Customer WHERE DisplayName = '${displayName.replace(/'/g, "''")}'`;
      
      const response = await this.makeRequest<{ QueryResponse: { Customer?: QuickBooksCustomer[] } }>(
        userId,
        'GET',
        `/query?query=${encodeURIComponent(query)}`,
        undefined,
        organizationId
      );
      
      if (!response.QueryResponse.Customer || response.QueryResponse.Customer.length === 0) {
        return null;
      }
      
      return response.QueryResponse.Customer[0];
    } catch (error) {
      console.error('Error finding QuickBooks customer by name:', error);
      throw error;
    }
  }
  
  /**
   * Create an invoice in QuickBooks
   * @param userId User ID
   * @param invoice Invoice data
   * @param organizationId Optional organization ID
   * @returns Created invoice
   */
  async createInvoice(
    userId: string,
    invoice: QuickBooksInvoice,
    organizationId?: string
  ): Promise<QuickBooksInvoice> {
    try {
      const response = await this.makeRequest<{ Invoice: QuickBooksInvoice }>(
        userId,
        'POST',
        '/invoice',
        invoice,
        organizationId
      );
      
      return response.Invoice;
    } catch (error) {
      console.error('Error creating QuickBooks invoice:', error);
      throw error;
    }
  }
  
  /**
   * Get an invoice from QuickBooks by ID
   * @param userId User ID
   * @param invoiceId QuickBooks invoice ID
   * @param organizationId Optional organization ID
   * @returns Invoice data
   */
  async getInvoice(
    userId: string,
    invoiceId: string,
    organizationId?: string
  ): Promise<QuickBooksInvoice> {
    try {
      const response = await this.makeRequest<{ Invoice: QuickBooksInvoice }>(
        userId,
        'GET',
        `/invoice/${invoiceId}`,
        undefined,
        organizationId
      );
      
      return response.Invoice;
    } catch (error) {
      console.error('Error getting QuickBooks invoice:', error);
      throw error;
    }
  }
  
  /**
   * Create a payment in QuickBooks
   * @param userId User ID
   * @param payment Payment data
   * @param organizationId Optional organization ID
   * @returns Created payment
   */
  async createPayment(
    userId: string,
    payment: QuickBooksPayment,
    organizationId?: string
  ): Promise<QuickBooksPayment> {
    try {
      const response = await this.makeRequest<{ Payment: QuickBooksPayment }>(
        userId,
        'POST',
        '/payment',
        payment,
        organizationId
      );
      
      return response.Payment;
    } catch (error) {
      console.error('Error creating QuickBooks payment:', error);
      throw error;
    }
  }
  
  /**
   * Create an item in QuickBooks
   * @param userId User ID
   * @param item Item data
   * @param organizationId Optional organization ID
   * @returns Created item
   */
  async createItem(
    userId: string,
    item: QuickBooksItem,
    organizationId?: string
  ): Promise<QuickBooksItem> {
    try {
      const response = await this.makeRequest<{ Item: QuickBooksItem }>(
        userId,
        'POST',
        '/item',
        item,
        organizationId
      );
      
      return response.Item;
    } catch (error) {
      console.error('Error creating QuickBooks item:', error);
      throw error;
    }
  }
  
  /**
   * Find an item in QuickBooks by name
   * @param userId User ID
   * @param name Item name
   * @param organizationId Optional organization ID
   * @returns Item data or null if not found
   */
  async findItemByName(
    userId: string,
    name: string,
    organizationId?: string
  ): Promise<QuickBooksItem | null> {
    try {
      const query = `SELECT * FROM Item WHERE Name = '${name.replace(/'/g, "''")}'`;
      
      const response = await this.makeRequest<{ QueryResponse: { Item?: QuickBooksItem[] } }>(
        userId,
        'GET',
        `/query?query=${encodeURIComponent(query)}`,
        undefined,
        organizationId
      );
      
      if (!response.QueryResponse.Item || response.QueryResponse.Item.length === 0) {
        return null;
      }
      
      return response.QueryResponse.Item[0];
    } catch (error) {
      console.error('Error finding QuickBooks item by name:', error);
      throw error;
    }
  }
  
  /**
   * Get income accounts from QuickBooks
   * @param userId User ID
   * @param organizationId Optional organization ID
   * @returns List of income accounts
   */
  async getIncomeAccounts(
    userId: string,
    organizationId?: string
  ): Promise<Array<{ Id: string; Name: string }>> {
    try {
      const query = "SELECT Id, Name FROM Account WHERE AccountType = 'Income'";
      
      const response = await this.makeRequest<{ QueryResponse: { Account?: Array<{ Id: string; Name: string }> } }>(
        userId,
        'GET',
        `/query?query=${encodeURIComponent(query)}`,
        undefined,
        organizationId
      );
      
      if (!response.QueryResponse.Account) {
        return [];
      }
      
      return response.QueryResponse.Account;
    } catch (error) {
      console.error('Error getting QuickBooks income accounts:', error);
      throw error;
    }
  }
  
  /**
   * Sync a ClimaBill customer to QuickBooks
   * @param userId User ID
   * @param customer ClimaBill customer data
   * @param organizationId Optional organization ID
   * @returns QuickBooks customer ID
   */
  async syncCustomer(
    userId: string,
    customer: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      company?: string;
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
      // Check if customer already exists in QuickBooks
      const existingCustomer = await this.findCustomerByName(userId, customer.name, organizationId);
      
      if (existingCustomer) {
        return existingCustomer.Id as string;
      }
      
      // Create customer in QuickBooks
      const quickbooksCustomer: QuickBooksCustomer = {
        DisplayName: customer.name,
        CompanyName: customer.company,
      };
      
      if (customer.email) {
        quickbooksCustomer.PrimaryEmailAddr = {
          Address: customer.email,
        };
      }
      
      if (customer.phone) {
        quickbooksCustomer.PrimaryPhone = {
          FreeFormNumber: customer.phone,
        };
      }
      
      if (customer.address) {
        quickbooksCustomer.BillAddr = {
          Line1: customer.address.line1,
          Line2: customer.address.line2,
          City: customer.address.city,
          CountrySubDivisionCode: customer.address.state,
          PostalCode: customer.address.postalCode,
          Country: customer.address.country,
        };
      }
      
      const createdCustomer = await this.createCustomer(userId, quickbooksCustomer, organizationId);
      
      return createdCustomer.Id as string;
    } catch (error) {
      console.error('Error syncing customer to QuickBooks:', error);
      throw error;
    }
  }
  
  /**
   * Sync a ClimaBill invoice to QuickBooks
   * @param userId User ID
   * @param invoice ClimaBill invoice data
   * @param quickbooksCustomerId QuickBooks customer ID
   * @param organizationId Optional organization ID
   * @returns QuickBooks invoice ID
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
      total: number;
      notes?: string;
    },
    quickbooksCustomerId: string,
    organizationId?: string
  ): Promise<string> {
    try {
      // Get income accounts
      const incomeAccounts = await this.getIncomeAccounts(userId, organizationId);
      
      if (incomeAccounts.length === 0) {
        throw new Error('No income accounts found in QuickBooks');
      }
      
      // Default income account
      const defaultIncomeAccount = incomeAccounts[0];
      
      // Create invoice items
      const invoiceLines = await Promise.all(
        invoice.items.map(async (item) => {
          // Try to find or create item
          let quickbooksItem = await this.findItemByName(
            userId,
            item.description,
            organizationId
          );
          
          if (!quickbooksItem) {
            quickbooksItem = await this.createItem(
              userId,
              {
                Name: item.description,
                Description: item.description,
                Type: 'Service',
                IncomeAccountRef: {
                  value: defaultIncomeAccount.Id,
                },
                UnitPrice: item.unitPrice,
              },
              organizationId
            );
          }
          
          return {
            DetailType: 'SalesItemLineDetail',
            Amount: item.amount,
            Description: item.description,
            SalesItemLineDetail: {
              ItemRef: {
                value: quickbooksItem.Id as string,
              },
              Qty: item.quantity,
              UnitPrice: item.unitPrice,
            },
          };
        })
      );
      
      // Create invoice in QuickBooks
      const quickbooksInvoice: QuickBooksInvoice = {
        CustomerRef: {
          value: quickbooksCustomerId,
        },
        TxnDate: invoice.date,
        DueDate: invoice.dueDate,
        Line: invoiceLines as any,
        DocNumber: invoice.number,
        PrivateNote: invoice.notes,
      };
      
      const createdInvoice = await this.createInvoice(userId, quickbooksInvoice, organizationId);
      
      return createdInvoice.Id as string;
    } catch (error) {
      console.error('Error syncing invoice to QuickBooks:', error);
      throw error;
    }
  }
  
  /**
   * Sync a ClimaBill payment to QuickBooks
   * @param userId User ID
   * @param payment ClimaBill payment data
   * @param quickbooksCustomerId QuickBooks customer ID
   * @param quickbooksInvoiceId QuickBooks invoice ID
   * @param organizationId Optional organization ID
   * @returns QuickBooks payment ID
   */
  async syncPayment(
    userId: string,
    payment: {
      id: string;
      date: string;
      amount: number;
      method?: string;
      notes?: string;
    },
    quickbooksCustomerId: string,
    quickbooksInvoiceId: string,
    organizationId?: string
  ): Promise<string> {
    try {
      // Create payment in QuickBooks
      const quickbooksPayment: QuickBooksPayment = {
        CustomerRef: {
          value: quickbooksCustomerId,
        },
        TxnDate: payment.date,
        TotalAmt: payment.amount,
        Line: [
          {
            Amount: payment.amount,
            LinkedTxn: [
              {
                TxnId: quickbooksInvoiceId,
                TxnType: 'Invoice',
              },
            ],
          },
        ],
        PrivateNote: payment.notes,
      };
      
      const createdPayment = await this.createPayment(userId, quickbooksPayment, organizationId);
      
      return createdPayment.Id as string;
    } catch (error) {
      console.error('Error syncing payment to QuickBooks:', error);
      throw error;
    }
  }
  
  /**
   * Get company information from QuickBooks
   * @param userId User ID
   * @param organizationId Optional organization ID
   * @returns Company information
   */
  async getCompanyInfo(
    userId: string,
    organizationId?: string
  ): Promise<any> {
    try {
      const response = await this.makeRequest<{ CompanyInfo: any }>(
        userId,
        'GET',
        '/companyinfo/1',
        undefined,
        organizationId
      );
      
      return response.CompanyInfo;
    } catch (error) {
      console.error('Error getting QuickBooks company info:', error);
      throw error;
    }
  }
}
