import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { InvoiceService, InvoiceStatus, Invoice } from '@/lib/billing/invoices/invoice-service';
import { TaxService } from '@/lib/billing/tax/taxjar-service';
import { logAuditEvent } from '@/lib/log/audit';

/**
 * GET handler for retrieving user invoices
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      logAuditEvent({
        eventType: 'billing:action',
        metadata: { error: 'Unauthorized', action: 'get-invoices' },
        ip: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get invoices by status
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as InvoiceStatus | null;
    
    const invoices = await InvoiceService.getCustomerInvoices(
      userId,
      status || undefined
    );
    
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error retrieving invoices:', error);
    logAuditEvent({
      eventType: 'billing:action',
      metadata: { error: error instanceof Error ? error.message : String(error), action: 'get-invoices' },
      ip: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new invoice
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      logAuditEvent({
        eventType: 'billing:action',
        metadata: { error: 'Unauthorized', action: 'create-invoice' },
        ip: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const data = await request.json();
    
    // Validate required fields
    if (!data.customerName || !data.customerEmail || !data.items || !data.items.length) {
      logAuditEvent({
        eventType: 'billing:action',
        userId,
        metadata: { error: 'Missing required fields', data },
        ip: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate invoice number
    const invoiceNumber = await InvoiceService.generateInvoiceNumber();
    
    // Calculate tax if customer address is provided
    let taxAmount = 0;
    
    if (data.customerAddress) {
      try {
        const { street, city, state, zip, country } = data.customerAddress;
        
        // Calculate subtotal
        const subtotal = data.items.reduce(
          (sum: number, item: any) => sum + (item.quantity * item.unitPrice),
          0
        );
        
        // Get tax calculation
        const taxResult = await TaxService.calculateTax({
          toCountry: country,
          toZip: zip,
          toState: state,
          toCity: city,
          toStreet: street,
          amount: subtotal,
          customerId: userId,
          exemptionType: data.exemptionType,
        });
        
        taxAmount = taxResult.tax.amount_to_collect;
        
        // Update items with tax information
        data.items = data.items.map((item: any) => {
          if (item.taxable) {
            const taxRate = taxResult.tax.rate;
            const itemTaxAmount = item.amount * taxRate;
            
            return {
              ...item,
              taxRate,
              taxAmount: itemTaxAmount,
            };
          }
          
          return item;
        });
      } catch (taxError) {
        console.error('Error calculating tax:', taxError);
        // Continue without tax calculation if it fails
      }
    }
    
    // Calculate totals
    const subtotal = data.items.reduce(
      (sum: number, item: any) => sum + item.amount,
      0
    );
    
    const total = subtotal + taxAmount;
    
    // Create the invoice
    const invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
      invoiceNumber,
      customerId: userId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerAddress: data.customerAddress,
      status: InvoiceStatus.DRAFT,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      items: data.items,
      subtotal,
      taxAmount,
      total,
      notes: data.notes,
      terms: data.terms,
      metadata: data.metadata,
    };
    
    const createdInvoice = await InvoiceService.createInvoice(invoice);
    logAuditEvent({
      eventType: 'billing:action',
      userId,
      metadata: { action: 'create-invoice', invoiceNumber, total },
      ip: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });
    return NextResponse.json({ invoice: createdInvoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    logAuditEvent({
      eventType: 'billing:action',
      metadata: { error: error instanceof Error ? error.message : String(error), action: 'create-invoice' },
      ip: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
