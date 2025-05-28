import { NextRequest, NextResponse } from 'next/server';
import { PayPalService } from '@/lib/billing/paypal/paypal-service';
import { SubscriptionService, SubscriptionProvider } from '@/lib/billing/subscription-service';
import { InvoiceService, InvoiceStatus } from '@/lib/billing/invoices/invoice-service';

/**
 * PayPal webhook handler
 * This endpoint receives webhook events from PayPal and processes them
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    // Get the PayPal headers for verification
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith('paypal-')) {
        headers[key] = value;
      }
    });
    
    // Verify the webhook signature
    let isValid = false;
    try {
      isValid = await PayPalService.verifyWebhookSignature(headers, body);
    } catch (err) {
      console.error('PayPal webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }
    
    // Parse the event
    const event = JSON.parse(body);
    
    // Handle the event based on its type
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.UPDATED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        // Process subscription events
        await SubscriptionService.processWebhookEvent(
          SubscriptionProvider.PAYPAL,
          event
        );
        break;
        
      case 'PAYMENT.SALE.COMPLETED':
        // Process successful payment
        const resource = event.resource;
        
        // Find the corresponding invoice in our system using custom_id or invoice_id
        if (resource.custom_id) {
          await InvoiceService.markInvoiceAsPaid(
            resource.custom_id,
            'paypal',
            resource.id
          );
        }
        break;
        
      case 'PAYMENT.SALE.DENIED':
      case 'PAYMENT.SALE.REFUNDED':
      case 'PAYMENT.SALE.REVERSED':
        // Process failed or refunded payment
        const paymentResource = event.resource;
        
        // Find the corresponding invoice in our system
        if (paymentResource.custom_id) {
          // Update the invoice status to reflect the failed payment
          await InvoiceService.updateInvoice(
            paymentResource.custom_id,
            { 
              status: event.event_type === 'PAYMENT.SALE.DENIED' 
                ? InvoiceStatus.OVERDUE 
                : InvoiceStatus.REFUNDED 
            }
          );
        }
        break;
        
      // Add more event types as needed
      
      default:
        console.log(`Unhandled PayPal event type: ${event.event_type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
