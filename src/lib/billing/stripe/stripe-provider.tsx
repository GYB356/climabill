"use client";

import React, { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from './config';

// Initialize Stripe with the publishable key
let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

interface StripeProviderProps {
  children: ReactNode;
}

/**
 * Provider component for Stripe Elements
 * Wrap components that need Stripe functionality with this provider
 */
export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <Elements stripe={getStripe()}>
      {children}
    </Elements>
  );
}

// Export the getStripe function for direct use
export { getStripe };
