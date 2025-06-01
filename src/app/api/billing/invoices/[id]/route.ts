import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { InvoiceService, InvoiceStatus } from '@/lib/billing/invoices/invoice-service';
import { StripeService } from '@/lib/billing/stripe/stripe-service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET handler for retrieving a specific invoice
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const invoiceId = (await params).id;
    
    // Get the invoice
    const invoice = await InvoiceService.getInvoice(invoiceId);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Check if the invoice belongs to the authenticated user
    if (invoice.customerId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Error retrieving invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for updating an invoice
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const invoiceId = (await params).id;
    
    // Get the invoice
    const invoice = await InvoiceService.getInvoice(invoiceId);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Check if the invoice belongs to the authenticated user
    if (invoice.customerId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const { action, data } = await request.json();
    
    // Handle different update actions
    if (action === 'update') {
      // Only allow updating draft invoices
      if (invoice.status !== InvoiceStatus.DRAFT) {
        return NextResponse.json(
          { error: 'Only draft invoices can be updated' },
          { status: 400 }
        );
      }
      
      const updatedInvoice = await InvoiceService.updateInvoice(invoiceId, data);
      return NextResponse.json({ invoice: updatedInvoice });
    } else if (action === 'finalize') {
      // Only allow finalizing draft invoices
      if (invoice.status !== InvoiceStatus.DRAFT) {
        return NextResponse.json(
          { error: 'Only draft invoices can be finalized' },
          { status: 400 }
        );
      }
      
      const updatedInvoice = await InvoiceService.updateInvoice(invoiceId, {
        status: InvoiceStatus.PENDING,
      });
      
      return NextResponse.json({ invoice: updatedInvoice });
    } else if (action === 'cancel') {
      // Only allow canceling pending invoices
      if (invoice.status !== InvoiceStatus.PENDING) {
        return NextResponse.json(
          { error: 'Only pending invoices can be canceled' },
          { status: 400 }
        );
      }
      
      const updatedInvoice = await InvoiceService.updateInvoice(invoiceId, {
        status: InvoiceStatus.CANCELED,
      });
      
      return NextResponse.json({ invoice: updatedInvoice });
    } else if (action === 'pay_with_stripe') {
      // Only allow paying pending invoices
      if (invoice.status !== InvoiceStatus.PENDING) {
        return NextResponse.json(
          { error: 'Only pending invoices can be paid' },
          { status: 400 }
        );
      }
      
      // Create or get Stripe customer
      const user = session.user;
      let customerId = data.stripeCustomerId;
      
      if (!customerId) {
        const customer = await StripeService.createCustomer(
          user.email as string,
          user.name || undefined,
          { userId }
        );
        
        customerId = customer.id;
      }
      
      // Create a Stripe invoice
      const stripeInvoice = await StripeService.createInvoice(
        customerId,
        `Invoice ${invoice.invoiceNumber}`,
        Math.round(invoice.total * 100) // Convert to cents
      );
      
      // Update our invoice with Stripe invoice ID
      const updatedInvoice = await InvoiceService.updateInvoice(invoiceId, {
        stripeInvoiceId: stripeInvoice.id,
        metadata: {
          ...invoice.metadata,
          stripeCustomerId: customerId,
        },
      });
      
      return NextResponse.json({
        invoice: updatedInvoice,
        paymentUrl: stripeInvoice.hosted_invoice_url,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
