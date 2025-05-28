import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16', // Use the latest stable API version
  appInfo: {
    name: 'ClimaBill',
    version: '1.0.0',
  },
});

// Public key for client-side Stripe initialization
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string;

// Webhook secret for verifying webhook events
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

// Product and price IDs for different subscription tiers
export const SUBSCRIPTION_TIERS = {
  BASIC: {
    productId: process.env.STRIPE_BASIC_PRODUCT_ID,
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    name: 'Basic',
    features: [
      'Up to 100 invoices per month',
      'Basic reporting',
      'Email support',
    ],
  },
  PROFESSIONAL: {
    productId: process.env.STRIPE_PRO_PRODUCT_ID,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    name: 'Professional',
    features: [
      'Unlimited invoices',
      'Advanced reporting',
      'Priority support',
      'Team access (up to 5 users)',
    ],
  },
  ENTERPRISE: {
    productId: process.env.STRIPE_ENTERPRISE_PRODUCT_ID,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    name: 'Enterprise',
    features: [
      'Unlimited invoices',
      'Custom reporting',
      'Dedicated account manager',
      'Unlimited team access',
      'API access',
      'Custom integrations',
    ],
  },
};

// Stripe checkout and portal configuration
export const STRIPE_SETTINGS = {
  checkoutSuccessUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
  checkoutCancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/canceled`,
  billingPortalReturnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
};
