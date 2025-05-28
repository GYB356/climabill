# ClimaBill Billing & Payment Engine

This directory contains the implementation of the ClimaBill Billing & Payment Engine, which provides subscription management, payment processing, invoice storage, and tax automation.

## Features

- **Subscription Management**: Create, update, and cancel subscriptions with tiered pricing plans.
- **Payment Processing**: Integration with Stripe and PayPal for secure payment processing.
- **Invoice Management**: Generate, store, and manage invoices with automatic numbering.
- **Tax Automation**: Calculate and apply taxes using TaxJar integration.
- **Proration**: Handle subscription upgrades and downgrades with proper proration.
- **Dunning**: Automated retry process for failed payments.

## Directory Structure

- `/stripe`: Stripe integration for payment processing
- `/paypal`: PayPal integration for payment processing
- `/tax`: Tax calculation and reporting using TaxJar
- `/invoices`: Invoice generation and management

## API Routes

- `/api/webhooks/stripe`: Webhook handler for Stripe events
- `/api/webhooks/paypal`: Webhook handler for PayPal events
- `/api/billing/subscriptions`: Subscription management endpoints
- `/api/billing/invoices`: Invoice management endpoints

## Environment Variables

The following environment variables need to be set in your `.env.local` file:

### Stripe Configuration
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Product and Price IDs
STRIPE_BASIC_PRODUCT_ID=prod_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PRO_PRODUCT_ID=prod_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRODUCT_ID=prod_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

### PayPal Configuration
```
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...

# Subscription Plan IDs
PAYPAL_BASIC_PLAN_ID=...
PAYPAL_PRO_PLAN_ID=...
PAYPAL_ENTERPRISE_PLAN_ID=...
```

### TaxJar Configuration
```
TAXJAR_API_KEY=...

# Company Information
COMPANY_ZIP_CODE=94107
COMPANY_STATE=CA
COMPANY_CITY=San Francisco
COMPANY_STREET=123 Main St
```

### Application URLs
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Instructions

1. Create accounts with Stripe, PayPal, and TaxJar to obtain API keys.
2. Set up the required environment variables in your `.env.local` file.
3. Create products and prices in Stripe and subscription plans in PayPal.
4. Configure webhooks in Stripe and PayPal to point to your webhook endpoints.

## Webhook Setup

### Stripe Webhooks

1. Go to the Stripe Dashboard > Developers > Webhooks
2. Add an endpoint with the URL: `https://your-domain.com/api/webhooks/stripe`
3. Select the following events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy the webhook signing secret and add it to your environment variables.

### PayPal Webhooks

1. Go to the PayPal Developer Dashboard > My Apps & Credentials
2. Select your app and go to Webhooks
3. Add a webhook with the URL: `https://your-domain.com/api/webhooks/paypal`
4. Select the following events:
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.DENIED`
   - `PAYMENT.SALE.REFUNDED`
   - `PAYMENT.SALE.REVERSED`
5. Copy the webhook ID and add it to your environment variables.

## Usage

### Creating a Subscription

```typescript
// Client-side
const response = await fetch('/api/billing/subscriptions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    provider: 'stripe', // or 'paypal'
    tier: 'basic', // or 'professional', 'enterprise'
  }),
});

const data = await response.json();
window.location.href = data.checkoutUrl;
```

### Canceling a Subscription

```typescript
// Client-side
const response = await fetch(`/api/billing/subscriptions/${subscriptionId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'cancel',
  }),
});

const data = await response.json();
```

### Creating an Invoice

```typescript
// Client-side
const response = await fetch('/api/billing/invoices', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerAddress: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
      country: 'US',
    },
    items: [
      {
        id: '1',
        description: 'Monthly Subscription',
        quantity: 1,
        unitPrice: 29.99,
        amount: 29.99,
        taxable: true,
      },
    ],
    notes: 'Thank you for your business!',
  }),
});

const data = await response.json();
```

## Testing

For local testing, you can use the Stripe CLI to forward webhook events to your local development server:

```
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

For PayPal, you can use ngrok to create a temporary public URL for your local server:

```
ngrok http 3000
```

Then update your PayPal webhook URL to the ngrok URL.
