import { QuickBooksService } from './quickbooks-service';
import { XeroService } from './xero-service';
import { OAuthService } from '../oauth/oauth-service';
import { OAuthProvider } from '../oauth/config';
import { firestore } from '../../firebase/admin';

/**
 * Accounting provider types
 */
export enum AccountingProvider {
  QUICKBOOKS = 'quickbooks',
  XERO = 'xero',
}

/**
 * Interface for accounting settings
 */
export interface AccountingSettings {
  provider: AccountingProvider | null;
  autoSync: boolean;
  syncCustomers: boolean;
  syncInvoices: boolean;
  syncPayments: boolean;
  syncInterval: 'hourly' | 'daily' | 'weekly' | 'manual';
  lastSyncTimestamp: number | null;
}

/**
 * Service for managing accounting integrations
 */
export class AccountingService {
  private quickbooksService: QuickBooksService;
  private xeroService: XeroService;
  private oauthService: OAuthService;
  
  constructor() {
    this.quickbooksService = new QuickBooksService();
    this.xeroService = new XeroService();
    this.oauthService = new OAuthService();
  }
  
  /**
   * Get accounting settings for a user
   * @param userId User ID
   * @returns Accounting settings
   */
  async getAccountingSettings(userId: string): Promise<AccountingSettings> {
    try {
      const settingsDoc = await firestore
        .collection('users')
        .doc(userId)
        .collection('settings')
        .doc('accounting')
        .get();
      
      if (!settingsDoc.exists) {
        // Return default settings
        return {
          provider: null,
          autoSync: false,
          syncCustomers: true,
          syncInvoices: true,
          syncPayments: true,
          syncInterval: 'daily',
          lastSyncTimestamp: null,
        };
      }
      
      return settingsDoc.data() as AccountingSettings;
    } catch (error) {
      console.error('Error getting accounting settings:', error);
      throw error;
    }
  }
  
  /**
   * Update accounting settings for a user
   * @param userId User ID
   * @param settings Accounting settings
   * @returns Updated accounting settings
   */
  async updateAccountingSettings(
    userId: string,
    settings: Partial<AccountingSettings>
  ): Promise<AccountingSettings> {
    try {
      const currentSettings = await this.getAccountingSettings(userId);
      
      // Merge settings
      const updatedSettings = {
        ...currentSettings,
        ...settings,
      };
      
      // Save to Firestore
      await firestore
        .collection('users')
        .doc(userId)
        .collection('settings')
        .doc('accounting')
        .set(updatedSettings);
      
      return updatedSettings;
    } catch (error) {
      console.error('Error updating accounting settings:', error);
      throw error;
    }
  }
  
  /**
   * Get the active accounting provider for a user
   * @param userId User ID
   * @returns Active accounting provider or null if none
   */
  async getActiveProvider(userId: string): Promise<AccountingProvider | null> {
    try {
      const settings = await this.getAccountingSettings(userId);
      return settings.provider;
    } catch (error) {
      console.error('Error getting active accounting provider:', error);
      throw error;
    }
  }
  
  /**
   * Set the active accounting provider for a user
   * @param userId User ID
   * @param provider Accounting provider
   * @returns Updated accounting settings
   */
  async setActiveProvider(
    userId: string,
    provider: AccountingProvider | null
  ): Promise<AccountingSettings> {
    try {
      return await this.updateAccountingSettings(userId, { provider });
    } catch (error) {
      console.error('Error setting active accounting provider:', error);
      throw error;
    }
  }
  
  /**
   * Check if a user has connected to an accounting provider
   * @param userId User ID
   * @param provider Accounting provider
   * @returns Whether the user has connected to the provider
   */
  async isProviderConnected(
    userId: string,
    provider: AccountingProvider
  ): Promise<boolean> {
    try {
      let oauthProvider: OAuthProvider;
      
      switch (provider) {
        case AccountingProvider.QUICKBOOKS:
          oauthProvider = OAuthProvider.QUICKBOOKS;
          break;
        case AccountingProvider.XERO:
          oauthProvider = OAuthProvider.XERO;
          break;
        default:
          return false;
      }
      
      const integration = await this.oauthService.getIntegration(userId, oauthProvider);
      return !!integration;
    } catch (error) {
      console.error('Error checking if provider is connected:', error);
      return false;
    }
  }
  
  /**
   * Sync a customer to the accounting provider
   * @param userId User ID
   * @param customer Customer data
   * @param organizationId Optional organization ID
   * @returns Provider customer ID
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
  ): Promise<string | null> {
    try {
      const provider = await this.getActiveProvider(userId);
      
      if (!provider) {
        throw new Error('No active accounting provider');
      }
      
      // Check if customer is already synced
      const syncDoc = await firestore
        .collection('users')
        .doc(userId)
        .collection('accounting')
        .doc('customers')
        .collection('synced')
        .doc(customer.id)
        .get();
      
      if (syncDoc.exists) {
        const syncData = syncDoc.data();
        if (syncData && syncData[provider]) {
          return syncData[provider];
        }
      }
      
      // Sync customer
      let providerId: string;
      
      switch (provider) {
        case AccountingProvider.QUICKBOOKS:
          providerId = await this.quickbooksService.syncCustomer(
            userId,
            customer,
            organizationId
          );
          break;
        case AccountingProvider.XERO:
          providerId = await this.xeroService.syncCustomer(
            userId,
            customer,
            organizationId
          );
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
      
      // Save sync data
      await firestore
        .collection('users')
        .doc(userId)
        .collection('accounting')
        .doc('customers')
        .collection('synced')
        .doc(customer.id)
        .set(
          {
            [provider]: providerId,
            lastSynced: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      
      return providerId;
    } catch (error) {
      console.error('Error syncing customer:', error);
      throw error;
    }
  }
  
  /**
   * Sync an invoice to the accounting provider
   * @param userId User ID
   * @param invoice Invoice data
   * @param organizationId Optional organization ID
   * @returns Provider invoice ID
   */
  async syncInvoice(
    userId: string,
    invoice: {
      id: string;
      number: string;
      customerId: string;
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
      currencyCode?: string;
      reference?: string;
    },
    organizationId?: string
  ): Promise<string | null> {
    try {
      const provider = await this.getActiveProvider(userId);
      
      if (!provider) {
        throw new Error('No active accounting provider');
      }
      
      // Check if invoice is already synced
      const syncDoc = await firestore
        .collection('users')
        .doc(userId)
        .collection('accounting')
        .doc('invoices')
        .collection('synced')
        .doc(invoice.id)
        .get();
      
      if (syncDoc.exists) {
        const syncData = syncDoc.data();
        if (syncData && syncData[provider]) {
          return syncData[provider];
        }
      }
      
      // Get customer provider ID
      const customerProviderId = await this.syncCustomer(
        userId,
        { id: invoice.customerId, name: 'Unknown' }, // Minimal data, will be fetched from DB
        organizationId
      );
      
      if (!customerProviderId) {
        throw new Error('Failed to sync customer');
      }
      
      // Sync invoice
      let providerId: string;
      
      switch (provider) {
        case AccountingProvider.QUICKBOOKS:
          providerId = await this.quickbooksService.syncInvoice(
            userId,
            invoice,
            customerProviderId,
            organizationId
          );
          break;
        case AccountingProvider.XERO:
          providerId = await this.xeroService.syncInvoice(
            userId,
            invoice,
            customerProviderId,
            organizationId
          );
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
      
      // Save sync data
      await firestore
        .collection('users')
        .doc(userId)
        .collection('accounting')
        .doc('invoices')
        .collection('synced')
        .doc(invoice.id)
        .set(
          {
            [provider]: providerId,
            lastSynced: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      
      return providerId;
    } catch (error) {
      console.error('Error syncing invoice:', error);
      throw error;
    }
  }
  
  /**
   * Sync a payment to the accounting provider
   * @param userId User ID
   * @param payment Payment data
   * @param organizationId Optional organization ID
   * @returns Provider payment ID
   */
  async syncPayment(
    userId: string,
    payment: {
      id: string;
      invoiceId: string;
      customerId: string;
      date: string;
      amount: number;
      method?: string;
      notes?: string;
      reference?: string;
    },
    organizationId?: string
  ): Promise<string | null> {
    try {
      const provider = await this.getActiveProvider(userId);
      
      if (!provider) {
        throw new Error('No active accounting provider');
      }
      
      // Check if payment is already synced
      const syncDoc = await firestore
        .collection('users')
        .doc(userId)
        .collection('accounting')
        .doc('payments')
        .collection('synced')
        .doc(payment.id)
        .get();
      
      if (syncDoc.exists) {
        const syncData = syncDoc.data();
        if (syncData && syncData[provider]) {
          return syncData[provider];
        }
      }
      
      // Get customer provider ID
      const customerProviderId = await this.syncCustomer(
        userId,
        { id: payment.customerId, name: 'Unknown' }, // Minimal data, will be fetched from DB
        organizationId
      );
      
      if (!customerProviderId) {
        throw new Error('Failed to sync customer');
      }
      
      // Get invoice provider ID
      const invoiceProviderId = await this.syncInvoice(
        userId,
        {
          id: payment.invoiceId,
          number: 'Unknown',
          customerId: payment.customerId,
          date: payment.date,
          dueDate: payment.date,
          items: [],
          total: payment.amount,
        }, // Minimal data, will be fetched from DB
        organizationId
      );
      
      if (!invoiceProviderId) {
        throw new Error('Failed to sync invoice');
      }
      
      // Sync payment
      let providerId: string;
      
      switch (provider) {
        case AccountingProvider.QUICKBOOKS:
          providerId = await this.quickbooksService.syncPayment(
            userId,
            payment,
            customerProviderId,
            invoiceProviderId,
            organizationId
          );
          break;
        case AccountingProvider.XERO:
          providerId = await this.xeroService.syncPayment(
            userId,
            payment,
            invoiceProviderId,
            organizationId
          );
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
      
      // Save sync data
      await firestore
        .collection('users')
        .doc(userId)
        .collection('accounting')
        .doc('payments')
        .collection('synced')
        .doc(payment.id)
        .set(
          {
            [provider]: providerId,
            lastSynced: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      
      return providerId;
    } catch (error) {
      console.error('Error syncing payment:', error);
      throw error;
    }
  }
  
  /**
   * Perform a full sync of all data to the accounting provider
   * @param userId User ID
   * @param options Sync options
   * @returns Sync results
   */
  async performFullSync(
    userId: string,
    options?: {
      syncCustomers?: boolean;
      syncInvoices?: boolean;
      syncPayments?: boolean;
      organizationId?: string;
    }
  ): Promise<{
    success: boolean;
    customersCount: number;
    invoicesCount: number;
    paymentsCount: number;
    errors: string[];
  }> {
    try {
      const settings = await this.getAccountingSettings(userId);
      
      if (!settings.provider) {
        throw new Error('No active accounting provider');
      }
      
      const syncCustomers = options?.syncCustomers ?? settings.syncCustomers;
      const syncInvoices = options?.syncInvoices ?? settings.syncInvoices;
      const syncPayments = options?.syncPayments ?? settings.syncPayments;
      const organizationId = options?.organizationId;
      
      const result = {
        success: true,
        customersCount: 0,
        invoicesCount: 0,
        paymentsCount: 0,
        errors: [] as string[],
      };
      
      // Sync customers
      if (syncCustomers) {
        try {
          const customersSnapshot = await firestore
            .collection('users')
            .doc(userId)
            .collection('customers')
            .get();
          
          for (const doc of customersSnapshot.docs) {
            try {
              const customer = doc.data();
              await this.syncCustomer(
                userId,
                {
                  id: doc.id,
                  name: customer.name,
                  email: customer.email,
                  phone: customer.phone,
                  company: customer.company,
                  address: customer.address,
                },
                organizationId
              );
              
              result.customersCount++;
            } catch (error) {
              console.error(`Error syncing customer ${doc.id}:`, error);
              result.errors.push(`Customer ${doc.id}: ${error.message}`);
            }
          }
        } catch (error) {
          console.error('Error syncing customers:', error);
          result.errors.push(`Customers: ${error.message}`);
          result.success = false;
        }
      }
      
      // Sync invoices
      if (syncInvoices) {
        try {
          const invoicesSnapshot = await firestore
            .collection('users')
            .doc(userId)
            .collection('invoices')
            .get();
          
          for (const doc of invoicesSnapshot.docs) {
            try {
              const invoice = doc.data();
              await this.syncInvoice(
                userId,
                {
                  id: doc.id,
                  number: invoice.number,
                  customerId: invoice.customerId,
                  date: invoice.date,
                  dueDate: invoice.dueDate,
                  items: invoice.items,
                  total: invoice.total,
                  notes: invoice.notes,
                  currencyCode: invoice.currencyCode,
                  reference: invoice.reference,
                },
                organizationId
              );
              
              result.invoicesCount++;
            } catch (error) {
              console.error(`Error syncing invoice ${doc.id}:`, error);
              result.errors.push(`Invoice ${doc.id}: ${error.message}`);
            }
          }
        } catch (error) {
          console.error('Error syncing invoices:', error);
          result.errors.push(`Invoices: ${error.message}`);
          result.success = false;
        }
      }
      
      // Sync payments
      if (syncPayments) {
        try {
          const paymentsSnapshot = await firestore
            .collection('users')
            .doc(userId)
            .collection('payments')
            .get();
          
          for (const doc of paymentsSnapshot.docs) {
            try {
              const payment = doc.data();
              await this.syncPayment(
                userId,
                {
                  id: doc.id,
                  invoiceId: payment.invoiceId,
                  customerId: payment.customerId,
                  date: payment.date,
                  amount: payment.amount,
                  method: payment.method,
                  notes: payment.notes,
                  reference: payment.reference,
                },
                organizationId
              );
              
              result.paymentsCount++;
            } catch (error) {
              console.error(`Error syncing payment ${doc.id}:`, error);
              result.errors.push(`Payment ${doc.id}: ${error.message}`);
            }
          }
        } catch (error) {
          console.error('Error syncing payments:', error);
          result.errors.push(`Payments: ${error.message}`);
          result.success = false;
        }
      }
      
      // Update last sync timestamp
      await this.updateAccountingSettings(userId, {
        lastSyncTimestamp: Date.now(),
      });
      
      return result;
    } catch (error) {
      console.error('Error performing full sync:', error);
      return {
        success: false,
        customersCount: 0,
        invoicesCount: 0,
        paymentsCount: 0,
        errors: [error.message],
      };
    }
  }
}
