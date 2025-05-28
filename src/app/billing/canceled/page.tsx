"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/protected-route';

export default function SubscriptionCanceledPage() {
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
            <div className="rounded-full bg-yellow-100 p-3">
              <svg
                className="h-12 w-12 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Subscription Canceled</h1>
          <p className="text-gray-600 mb-6">
            Your subscription process was canceled. No charges have been made to your account.
          </p>
          <p className="text-gray-500 mb-8">
            You will be redirected to the billing page in a few seconds...
          </p>
          <div className="flex flex-col space-y-3">
            <Link
              href="/billing"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Return to Billing
            </Link>
            <Link
              href="/support"
              className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
