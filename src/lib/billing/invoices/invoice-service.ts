import { firestore } from '../../firebase/config';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentReference,
  DocumentData
} from 'firebase/firestore';

// Invoice status types
export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

// Invoice item interface
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxable: boolean;
  taxRate?: number;
  taxAmount?: number;
}

// Invoice interface
export interface Invoice {
  id?: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  status: InvoiceStatus;
  issueDate: Date | Timestamp;
  dueDate: Date | Timestamp;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  paymentMethod?: string;
  paymentId?: string;
  paidDate?: Date | Timestamp | null;
  stripeInvoiceId?: string;
  paypalInvoiceId?: string;
  metadata?: Record<string, any>;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Service for managing invoices
 */
export class InvoiceService {
  private static readonly COLLECTION = 'invoices';

  /**
   * Create a new invoice
   * @param invoice Invoice data
   * @returns Created invoice with ID
   */
  static async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    try {
      const now = Timestamp.now();
      
      // Format dates as Firestore Timestamps
      const invoiceData = {
        ...invoice,
        issueDate: invoice.issueDate instanceof Date ? Timestamp.fromDate(invoice.issueDate) : invoice.issueDate,
        dueDate: invoice.dueDate instanceof Date ? Timestamp.fromDate(invoice.dueDate) : invoice.dueDate,
        paidDate: invoice.paidDate instanceof Date ? Timestamp.fromDate(invoice.paidDate as Date) : invoice.paidDate,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(firestore, this.COLLECTION), invoiceData);
      
      return {
        ...invoiceData,
        id: docRef.id,
      } as Invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Update an existing invoice
   * @param id Invoice ID
   * @param invoice Invoice data to update
   * @returns Updated invoice
   */
  static async updateInvoice(id: string, invoice: Partial<Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Invoice> {
    try {
      const now = Timestamp.now();
      
      // Format dates as Firestore Timestamps if they exist
      const invoiceData: Partial<Invoice> = {
        ...invoice,
        updatedAt: now,
      };
      
      if (invoice.issueDate) {
        invoiceData.issueDate = invoice.issueDate instanceof Date 
          ? Timestamp.fromDate(invoice.issueDate) 
          : invoice.issueDate;
      }
      
      if (invoice.dueDate) {
        invoiceData.dueDate = invoice.dueDate instanceof Date 
          ? Timestamp.fromDate(invoice.dueDate) 
          : invoice.dueDate;
      }
      
      if (invoice.paidDate) {
        invoiceData.paidDate = invoice.paidDate instanceof Date 
          ? Timestamp.fromDate(invoice.paidDate) 
          : invoice.paidDate;
      }
      
      const docRef = doc(firestore, this.COLLECTION, id);
      await updateDoc(docRef, invoiceData);
      
      // Get the updated document
      const updatedDoc = await getDoc(docRef);
      
      if (!updatedDoc.exists()) {
        throw new Error(`Invoice with ID ${id} not found`);
      }
      
      return {
        ...updatedDoc.data(),
        id: updatedDoc.id,
      } as Invoice;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  /**
   * Get an invoice by ID
   * @param id Invoice ID
   * @returns Invoice data
   */
  static async getInvoice(id: string): Promise<Invoice | null> {
    try {
      const docRef = doc(firestore, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return {
        ...docSnap.data(),
        id: docSnap.id,
      } as Invoice;
    } catch (error) {
      console.error('Error getting invoice:', error);
      throw error;
    }
  }

  /**
   * Get invoices for a customer
   * @param customerId Customer ID
   * @param status Optional status filter
   * @param limit Maximum number of invoices to return
   * @returns List of invoices
   */
  static async getCustomerInvoices(
    customerId: string, 
    status?: InvoiceStatus,
    limitCount = 100
  ): Promise<Invoice[]> {
    try {
      let q = query(
        collection(firestore, this.COLLECTION),
        where('customerId', '==', customerId),
        orderBy('issueDate', 'desc'),
        limit(limitCount)
      );
      
      if (status) {
        q = query(
          collection(firestore, this.COLLECTION),
          where('customerId', '==', customerId),
          where('status', '==', status),
          orderBy('issueDate', 'desc'),
          limit(limitCount)
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Invoice[];
    } catch (error) {
      console.error('Error getting customer invoices:', error);
      throw error;
    }
  }

  /**
   * Mark an invoice as paid
   * @param id Invoice ID
   * @param paymentMethod Payment method used
   * @param paymentId Payment ID from payment processor
   * @returns Updated invoice
   */
  static async markInvoiceAsPaid(
    id: string, 
    paymentMethod: string, 
    paymentId: string
  ): Promise<Invoice> {
    try {
      const now = Timestamp.now();
      
      const invoiceData = {
        status: InvoiceStatus.PAID,
        paymentMethod,
        paymentId,
        paidDate: now,
        updatedAt: now,
      };
      
      const docRef = doc(firestore, this.COLLECTION, id);
      await updateDoc(docRef, invoiceData);
      
      // Get the updated document
      const updatedDoc = await getDoc(docRef);
      
      if (!updatedDoc.exists()) {
        throw new Error(`Invoice with ID ${id} not found`);
      }
      
      return {
        ...updatedDoc.data(),
        id: updatedDoc.id,
      } as Invoice;
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      throw error;
    }
  }

  /**
   * Mark an invoice as overdue
   * @param id Invoice ID
   * @returns Updated invoice
   */
  static async markInvoiceAsOverdue(id: string): Promise<Invoice> {
    try {
      const now = Timestamp.now();
      
      const invoiceData = {
        status: InvoiceStatus.OVERDUE,
        updatedAt: now,
      };
      
      const docRef = doc(firestore, this.COLLECTION, id);
      await updateDoc(docRef, invoiceData);
      
      // Get the updated document
      const updatedDoc = await getDoc(docRef);
      
      if (!updatedDoc.exists()) {
        throw new Error(`Invoice with ID ${id} not found`);
      }
      
      return {
        ...updatedDoc.data(),
        id: updatedDoc.id,
      } as Invoice;
    } catch (error) {
      console.error('Error marking invoice as overdue:', error);
      throw error;
    }
  }

  /**
   * Generate a unique invoice number
   * @param prefix Optional prefix for the invoice number
   * @returns Unique invoice number
   */
  static async generateInvoiceNumber(prefix = 'INV'): Promise<string> {
    try {
      // Get the current date
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      
      // Get the latest invoice to determine the next sequence number
      const q = query(
        collection(firestore, this.COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      let sequenceNumber = 1;
      
      if (!querySnapshot.empty) {
        const latestInvoice = querySnapshot.docs[0].data() as Invoice;
        const latestInvoiceNumber = latestInvoice.invoiceNumber;
        
        // Extract the sequence number from the latest invoice number
        const match = latestInvoiceNumber.match(/(\d+)$/);
        
        if (match && match[1]) {
          sequenceNumber = parseInt(match[1], 10) + 1;
        }
      }
      
      // Format the sequence number with leading zeros
      const formattedSequence = sequenceNumber.toString().padStart(5, '0');
      
      // Combine all parts to create the invoice number
      return `${prefix}-${year}${month}-${formattedSequence}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      throw error;
    }
  }

  /**
   * Get invoices by status
   * @param status Invoice status
   * @param limitCount Maximum number of invoices to return
   * @returns List of invoices
   */
  static async getInvoicesByStatus(
    status: InvoiceStatus,
    limitCount = 100
  ): Promise<Invoice[]> {
    try {
      const q = query(
        collection(firestore, this.COLLECTION),
        where('status', '==', status),
        orderBy('issueDate', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Invoice[];
    } catch (error) {
      console.error('Error getting invoices by status:', error);
      throw error;
    }
  }

  /**
   * Get overdue invoices
   * @param limitCount Maximum number of invoices to return
   * @returns List of overdue invoices
   */
  static async getOverdueInvoices(limitCount = 100): Promise<Invoice[]> {
    try {
      const now = Timestamp.now();
      
      // Get pending invoices with due date before now
      const q = query(
        collection(firestore, this.COLLECTION),
        where('status', '==', InvoiceStatus.PENDING),
        where('dueDate', '<', now),
        orderBy('dueDate', 'asc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Invoice[];
    } catch (error) {
      console.error('Error getting overdue invoices:', error);
      throw error;
    }
  }
}
