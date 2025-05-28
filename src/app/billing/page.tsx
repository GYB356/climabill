"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/firebase/auth-context';
import { SubscriptionTier, SubscriptionStatus, SubscriptionProvider } from '@/lib/billing/subscription-service';
import { SUBSCRIPTION_TIERS } from '@/lib/billing/stripe/config';
import { StripeProvider } from '@/lib/billing/stripe/stripe-provider';
import { PayPalProvider } from '@/lib/billing/paypal/paypal-provider';
import { ProtectedRoute } from '@/components/protected-route';

interface Subscription {
  id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  provider: SubscriptionProvider;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

interface PricingTier {
  id: SubscriptionTier;
  name: string;
  price: string;
  description: string;
  features: string[];
}

const pricingTiers: PricingTier[] = [
  {
    id: SubscriptionTier.BASIC,
    name: 'Basic',
    price: '$9.99',
    description: 'Perfect for small businesses',
    features: [
      'Up to 100 invoices per month',
      'Basic reporting',
      'Email support',
    ],
  },
  {
    id: SubscriptionTier.PROFESSIONAL,
    name: 'Professional',
    price: '$29.99',
    description: 'For growing businesses',
    features: [
      'Unlimited invoices',
      'Advanced reporting',
      'Priority support',
      'Team access (up to 5 users)',
    ],
  },
  {
    id: SubscriptionTier.ENTERPRISE,
    name: 'Enterprise',
    price: '$99.99',
    description: 'For large organizations',
    features: [
      'Unlimited invoices',
      'Custom reporting',
      'Dedicated account manager',
      'Unlimited team access',
      'API access',
      'Custom integrations',
    ],
  },
];

export default function BillingPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'stripe' | 'paypal'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's active subscription
  useEffect(() => {
    if (!loading && user) {
      fetchSubscription();
    }
  }, [user, loading]);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/billing/subscriptions?active=true');
      const data = await response.json();
      
      if (data.subscription) {
        setSubscription({
          ...data.subscription,
          currentPeriodEnd: new Date(data.subscription.currentPeriodEnd.seconds * 1000),
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError('Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTier = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
  };

  const handleSelectProvider = (provider: 'stripe' | 'paypal') => {
    setSelectedProvider(provider);
  };

  const handleSubscribe = async () => {
    if (!selectedTier) {
      setError('Please select a subscription tier');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch('/api/billing/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: selectedProvider,
          tier: selectedTier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      // Redirect to checkout URL
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error('Error creating subscription:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch(`/api/billing/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Refresh subscription data
      fetchSubscription();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeTier = async (newTier: SubscriptionTier) => {
    if (!subscription) return;

    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch(`/api/billing/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'change_tier',
          tier: newTier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change subscription tier');
      }

      // Refresh subscription data
      fetchSubscription();
    } catch (error) {
      console.error('Error changing subscription tier:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute>
      <StripeProvider>
        <PayPalProvider>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : subscription ? (
              <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4">Current Subscription</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Plan:</span> {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Status:</span> {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Payment Provider:</span> {subscription.provider.charAt(0).toUpperCase() + subscription.provider.slice(1)}
                    </p>
                    <p className="text-gray-600 mb-4">
                      <span className="font-medium">Current Period Ends:</span> {subscription.currentPeriodEnd.toLocaleDateString()}
                    </p>
                    
                    {subscription.cancelAtPeriodEnd && (
                      <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-4">
                        Your subscription is set to cancel at the end of the current billing period.
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-3">
                    {!subscription.cancelAtPeriodEnd && (
                      <button
                        onClick={handleCancelSubscription}
                        disabled={isProcessing}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : 'Cancel Subscription'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => router.push('/billing/invoices')}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                    >
                      View Invoices
                    </button>
                    
                    <button
                      onClick={() => router.push('/billing/payment-methods')}
                      className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                    >
                      Manage Payment Methods
                    </button>
                  </div>
                </div>

                {subscription.status === SubscriptionStatus.ACTIVE && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Change Subscription Plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {pricingTiers.map((tier) => (
                        <div
                          key={tier.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            subscription.tier === tier.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => {
                            if (subscription.tier !== tier.id) {
                              handleChangeTier(tier.id);
                            }
                          }}
                        >
                          <h4 className="text-lg font-semibold">{tier.name}</h4>
                          <p className="text-2xl font-bold my-2">{tier.price}<span className="text-sm font-normal text-gray-500">/month</span></p>
                          <p className="text-gray-600 mb-2">{tier.description}</p>
                          {subscription.tier === tier.id && (
                            <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              Current Plan
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-6">Choose a Subscription Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {pricingTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`border rounded-lg p-6 cursor-pointer transition-all ${
                        selectedTier === tier.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => handleSelectTier(tier.id)}
                    >
                      <h3 className="text-xl font-semibold">{tier.name}</h3>
                      <p className="text-3xl font-bold my-3">{tier.price}<span className="text-sm font-normal text-gray-500">/month</span></p>
                      <p className="text-gray-600 mb-4">{tier.description}</p>
                      <ul className="space-y-2 mb-6">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <svg
                              className="h-5 w-5 text-green-500 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {selectedTier === tier.id && (
                        <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Selected
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {selectedTier && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
                    <div className="flex space-x-4 mb-6">
                      <button
                        className={`flex items-center border rounded-lg px-4 py-2 ${
                          selectedProvider === 'stripe'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                        onClick={() => handleSelectProvider('stripe')}
                      >
                        <svg
                          className="h-6 w-6 mr-2"
                          viewBox="0 0 60 25"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.02-13.17 4.02-.86v3.54h3.14V9.1h-3.14v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z"
                            fill="#6772E5"
                            fillRule="evenodd"
                          ></path>
                        </svg>
                        Credit Card
                      </button>
                      <button
                        className={`flex items-center border rounded-lg px-4 py-2 ${
                          selectedProvider === 'paypal'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                        onClick={() => handleSelectProvider('paypal')}
                      >
                        <svg
                          className="h-6 w-6 mr-2"
                          viewBox="0 0 101 32"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.237 2.4H4.437c-.563 0-1.037.4-1.125.95L.012 27.75c-.063.4.25.762.65.762h5.525c.563 0 1.037-.4 1.125-.95l.9-5.7c.088-.55.563-.95 1.125-.95h2.475c5.4 0 8.525-2.613 9.35-7.8.375-2.275.013-4.062-1.05-5.312-1.175-1.4-3.25-2.138-6-2.138l.125-.212zM13.4 11.875c-.45 2.95-2.7 2.95-4.875 2.95h-1.25l.875-5.512c.05-.325.337-.563.675-.563h.575c1.487 0 2.887 0 3.6.85.425.5.55 1.25.4 2.275zM35.012 11.75h-5.537c-.338 0-.625.238-.675.563l-.175 1.112-.275-.4c-.85-1.237-2.75-1.65-4.65-1.65-4.35 0-8.075 3.3-8.8 7.925-.375 2.313.15 4.525 1.45 6.062 1.188 1.413 2.888 2 4.9 2 3.462 0 5.387-2.225 5.387-2.225l-.175 1.075c-.063.4.25.763.65.763h4.988c.563 0 1.037-.4 1.125-.95l2.125-13.513c.075-.4-.238-.762-.638-.762h.3zm-7.75 7.612c-.375 2.25-2.175 3.75-4.45 3.75-1.138 0-2.05-.363-2.637-1.05-.575-.688-.788-1.663-.613-2.75.35-2.213 2.175-3.763 4.413-3.763 1.113 0 2.025.363 2.625 1.063.6.7.825 1.675.663 2.75h-.001zM53.587 11.75h-5.55c-.5 0-.975.25-1.25.663l-3.5 5.162-1.5-4.925c-.188-.625-.762-1.05-1.425-1.05h-5.45c-.613 0-1.037.6-.85 1.175l2.825 8.288-2.65 3.737c-.413.588 0 1.4.7 1.4h5.538c.5 0 .974-.238 1.25-.65l8.524-12.3c.413-.587.013-1.4-.662-1.4z"
                            fill="#003087"
                          ></path>
                          <path
                            d="M69.237 2.4H61.45c-.563 0-1.037.4-1.125.95l-3.3 20.95c-.063.4.25.762.65.762h4.05c.375 0 .7-.275.75-.65l.938-5.95c.087-.55.562-.95 1.125-.95h2.475c5.4 0 8.524-2.613 9.35-7.8.375-2.275.012-4.062-1.05-5.312-1.175-1.4-3.25-2.138-6-2.138l-.076.138zM70.4 11.875c-.45 2.95-2.7 2.95-4.875 2.95h-1.25l.875-5.512c.05-.325.338-.563.675-.563h.575c1.488 0 2.888 0 3.6.85.425.5.55 1.25.4 2.275zM92.012 11.75h-5.537c-.337 0-.625.238-.675.563l-.175 1.112-.275-.4c-.85-1.237-2.75-1.65-4.65-1.65-4.35 0-8.075 3.3-8.8 7.925-.375 2.313.15 4.525 1.45 6.062 1.188 1.413 2.888 2 4.9 2 3.463 0 5.388-2.225 5.388-2.225l-.175 1.075c-.063.4.25.763.65.763h4.987c.563 0 1.038-.4 1.125-.95l2.125-13.513c.075-.4-.238-.762-.638-.762h.3zm-7.737 7.612c-.375 2.25-2.175 3.75-4.45 3.75-1.137 0-2.05-.363-2.637-1.05-.575-.688-.787-1.663-.612-2.75.35-2.213 2.175-3.763 4.412-3.763 1.113 0 2.025.363 2.625 1.063.6.7.825 1.675.663 2.75h-.001zM95.225 3.537L91.95 27.75c-.062.4.25.762.65.762h4.888c.562 0 1.037-.4 1.125-.95l3.3-20.95c.063-.4-.25-.762-.65-.762h-5.475c-.338 0-.625.237-.675.562l.112.125z"
                            fill="#0070E0"
                          ></path>
                        </svg>
                        PayPal
                      </button>
                    </div>

                    <button
                      onClick={handleSubscribe}
                      disabled={isProcessing}
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Subscribe Now'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </PayPalProvider>
      </StripeProvider>
    </ProtectedRoute>
  );
}
