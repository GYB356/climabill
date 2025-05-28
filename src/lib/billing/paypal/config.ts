/**
 * PayPal configuration
 */

// PayPal API credentials
export const PAYPAL_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET as string,
  environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
};

// PayPal subscription plan IDs for different tiers
export const PAYPAL_SUBSCRIPTION_PLANS = {
  BASIC: process.env.PAYPAL_BASIC_PLAN_ID as string,
  PROFESSIONAL: process.env.PAYPAL_PRO_PLAN_ID as string,
  ENTERPRISE: process.env.PAYPAL_ENTERPRISE_PLAN_ID as string,
};

// PayPal webhook ID for verifying webhook events
export const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID as string;

// URLs for PayPal callbacks
export const PAYPAL_SETTINGS = {
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/canceled`,
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
};
