import { stripe, STRIPE_SETTINGS } from './config';
import Stripe from 'stripe';

/**
 * Service for handling Stripe-related operations
 */
export class StripeService {
  /**
   * Create a Stripe customer
   * @param email Customer email
   * @param name Customer name
   * @param metadata Additional metadata
   * @returns Stripe customer object
   */
  static async createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Customer> {
    return stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  /**
   * Get a Stripe customer by ID
   * @param customerId Stripe customer ID
   * @returns Stripe customer object
   */
  static async getCustomer(customerId: string): Promise<Stripe.Customer> {
    return stripe.customers.retrieve(customerId) as Promise<Stripe.Customer>;
  }

  /**
   * Update a Stripe customer
   * @param customerId Stripe customer ID
   * @param data Customer data to update
   * @returns Updated Stripe customer object
   */
  static async updateCustomer(
    customerId: string,
    data: Stripe.CustomerUpdateParams
  ): Promise<Stripe.Customer> {
    return stripe.customers.update(customerId, data);
  }

  /**
   * Create a checkout session for subscription
   * @param customerId Stripe customer ID
   * @param priceId Stripe price ID
   * @param trialDays Optional trial period in days
   * @returns Checkout session
   */
  static async createSubscriptionCheckoutSession(
    customerId: string,
    priceId: string,
    trialDays?: number
  ): Promise<Stripe.Checkout.Session> {
    const params: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: trialDays
        ? { trial_period_days: trialDays }
        : undefined,
      success_url: STRIPE_SETTINGS.checkoutSuccessUrl,
      cancel_url: STRIPE_SETTINGS.checkoutCancelUrl,
    };

    return stripe.checkout.sessions.create(params);
  }

  /**
   * Create a customer portal session
   * @param customerId Stripe customer ID
   * @returns Customer portal session
   */
  static async createCustomerPortalSession(
    customerId: string
  ): Promise<Stripe.BillingPortal.Session> {
    return stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: STRIPE_SETTINGS.billingPortalReturnUrl,
    });
  }

  /**
   * Get a subscription by ID
   * @param subscriptionId Stripe subscription ID
   * @returns Stripe subscription object
   */
  static async getSubscription(
    subscriptionId: string
  ): Promise<Stripe.Subscription> {
    return stripe.subscriptions.retrieve(subscriptionId);
  }

  /**
   * Get all subscriptions for a customer
   * @param customerId Stripe customer ID
   * @returns List of subscriptions
   */
  static async getCustomerSubscriptions(
    customerId: string
  ): Promise<Stripe.ApiList<Stripe.Subscription>> {
    return stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method'],
    });
  }

  /**
   * Cancel a subscription
   * @param subscriptionId Stripe subscription ID
   * @param immediately Whether to cancel immediately or at period end
   * @returns Canceled subscription
   */
  static async cancelSubscription(
    subscriptionId: string,
    immediately = false
  ): Promise<Stripe.Subscription> {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: !immediately,
    });
  }

  /**
   * Update a subscription
   * @param subscriptionId Stripe subscription ID
   * @param newPriceId New price ID
   * @returns Updated subscription
   */
  static async updateSubscription(
    subscriptionId: string,
    newPriceId: string
  ): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    return stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }

  /**
   * Create an invoice for a customer
   * @param customerId Stripe customer ID
   * @param description Invoice description
   * @param amount Amount in cents
   * @param currency Currency code
   * @returns Created invoice
   */
  static async createInvoice(
    customerId: string,
    description: string,
    amount: number,
    currency = 'usd'
  ): Promise<Stripe.Invoice> {
    // First create an invoice item
    await stripe.invoiceItems.create({
      customer: customerId,
      amount,
      currency,
      description,
    });

    // Then create and finalize the invoice
    const invoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: true, // Auto-finalize and send the invoice
    });

    return invoice;
  }

  /**
   * Verify a Stripe webhook signature
   * @param payload Request body
   * @param signature Stripe signature from headers
   * @param webhookSecret Webhook secret
   * @returns Stripe event if signature is valid
   */
  static constructEventFromPayload(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  }
}
