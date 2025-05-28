import { NextRequest, NextResponse } from 'next/server';
import { CarbonOffsetService } from '@/lib/carbon/carbon-offset-service';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { PaymentGateway } from '@/lib/carbon/config';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

// Disable body parsing to get raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * POST /api/carbon/webhook
 * Webhook handler for payment processing
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body
    const rawBody = await request.text();
    
    // Get signature header
    const signature = request.headers.get('stripe-signature') || '';
    
    // Determine payment gateway from request
    let paymentGateway: PaymentGateway;
    let event: any;
    let paymentId: string;
    let donationId: string;
    
    // Handle Stripe webhook
    if (signature) {
      paymentGateway = PaymentGateway.STRIPE;
      
      // Verify signature
      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET as string
        );
      } catch (err) {
        console.error('Stripe webhook signature verification failed:', err);
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }
      
      // Process Stripe event
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        paymentId = paymentIntent.id;
        donationId = paymentIntent.metadata.donationId;
      } else {
        // Ignore other event types
        return NextResponse.json({ received: true });
      }
    } 
    // Handle PayPal webhook
    else if (request.headers.get('paypal-auth-algo')) {
      paymentGateway = PaymentGateway.PAYPAL;
      
      // Parse PayPal event
      const paypalEvent = JSON.parse(rawBody);
      
      // Process PayPal event
      if (paypalEvent.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const resource = paypalEvent.resource;
        paymentId = resource.id;
        donationId = resource.custom_id;
      } else {
        // Ignore other event types
        return NextResponse.json({ received: true });
      }
    } else {
      return NextResponse.json(
        { error: 'Unknown payment gateway' },
        { status: 400 }
      );
    }
    
    // Process donation payment
    if (donationId && paymentId) {
      const carbonOffsetService = new CarbonOffsetService();
      await carbonOffsetService.processDonationPayment(donationId, paymentId);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
