"use client";

import React, { ReactNode } from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { PAYPAL_CONFIG } from './config';

interface PayPalProviderProps {
  children: ReactNode;
}

/**
 * Provider component for PayPal integration
 * Wrap components that need PayPal functionality with this provider
 */
export function PayPalProvider({ children }: PayPalProviderProps) {
  const initialOptions = {
    clientId: PAYPAL_CONFIG.clientId,
    currency: 'USD',
    intent: 'subscription',
    vault: true,
    components: 'buttons,funding-eligibility',
    'enable-funding': 'venmo,card',
    'disable-funding': 'paylater,credit',
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
}
