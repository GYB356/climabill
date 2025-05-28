import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/billing/stripe/config';
import { StripeService } from '@/lib/billing/stripe/stripe-service';
import { SubscriptionService, SubscriptionProvider } from '@/lib/billing/subscription-service';
import { InvoiceService, InvoiceStatus } from '@/lib/billing/invoices/invoice-service';

/**
 * Stripe webhook handler
 * This endpoint receives webhook events from Stripe and processes them
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') as string;

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event;
    try {
      event = StripeService.constructEventFromPayload(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event based on its type
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Process subscription events
        await SubscriptionService.processWebhookEvent(
          SubscriptionProvider.STRIPE,
          event
        );
        break;

      case 'invoice.paid':
        // Process successful payment
        const invoice = event.data.object;
        
        // Find the corresponding invoice in our system
        if (invoice.metadata && invoice.metadata.invoiceId) {
          await InvoiceService.markInvoiceAsPaid(
            invoice.metadata.invoiceId,
            'stripe',
            invoice.id
          );
        }
        break;

      case 'invoice.payment_failed':
        // Process failed payment
        const failedInvoice = event.data.object;
        
        // Find the corresponding invoice in our system
        if (failedInvoice.metadata && failedInvoice.metadata.invoiceId) {
          // Update the invoice status to reflect the failed payment
          await InvoiceService.updateInvoice(
            failedInvoice.metadata.invoiceId,
            { status: InvoiceStatus.OVERDUE }
          );
        }
        break;

      // Add more event types as needed
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
