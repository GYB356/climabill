"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/protected-route';

export default function SubscriptionSuccessPage() {
  const router = useRouter();

  // Redirect to billing page after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/billing');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg
                className="h-12 w-12 text-green-500"
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
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Subscription Successful!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for subscribing to ClimaBill. Your subscription has been successfully processed.
          </p>
          <p className="text-gray-500 mb-8">
            You will be redirected to your billing dashboard in a few seconds...
          </p>
          <Link
            href="/billing"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Go to Billing Dashboard
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
