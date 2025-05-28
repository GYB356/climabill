"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/firebase/auth-context';
import { ProtectedRoute } from '@/components/protected-route';

export default function BlockchainDashboardPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Blockchain Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Manage your blockchain wallets and invoices with secure, decentralized technology.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wallet Management Card */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Wallet Management</h2>
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-6">
                Create and manage your blockchain wallets for Ethereum and Polkadot networks.
                Securely store your private keys and access your funds.
              </p>
              <ul className="list-disc pl-5 mb-6 text-gray-600">
                <li>Create new wallets with secure encryption</li>
                <li>Import existing wallets using private keys or mnemonic phrases</li>
                <li>View wallet balances and transaction history</li>
                <li>Manage multiple wallets across different networks</li>
              </ul>
              <button
                onClick={() => handleNavigate('/blockchain/wallet')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full"
              >
                Manage Wallets
              </button>
            </div>
          </div>

          {/* Invoice Management Card */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Blockchain Invoices</h2>
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-6">
                Create and manage invoices on the blockchain with immutable records and secure payments.
                Track payment status and verify transactions.
              </p>
              <ul className="list-disc pl-5 mb-6 text-gray-600">
                <li>Create blockchain-based invoices with smart contracts</li>
                <li>Store invoice details securely on IPFS</li>
                <li>Track payment status with real-time updates</li>
                <li>Verify transactions on the blockchain</li>
              </ul>
              <button
                onClick={() => handleNavigate('/blockchain/invoice')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md w-full"
              >
                Manage Invoices
              </button>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">How Blockchain Integration Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-blue-500 font-bold text-lg mb-2">1. Wallet Creation</div>
                <p className="text-gray-600">
                  Create or import your blockchain wallet with secure encryption.
                  Your private keys are encrypted and never leave your device.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-blue-500 font-bold text-lg mb-2">2. Invoice Creation</div>
                <p className="text-gray-600">
                  Create invoices using smart contracts on the blockchain.
                  Invoice details are stored securely on IPFS with a reference on the blockchain.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-blue-500 font-bold text-lg mb-2">3. Payment Processing</div>
                <p className="text-gray-600">
                  Payments are processed directly on the blockchain with transparent,
                  immutable records. Track payment status in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Benefits of Blockchain Integration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium">Security</h3>
                  <p className="text-gray-600">
                    Blockchain technology provides enhanced security with cryptographic protection
                    and decentralized storage of invoice records.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium">Transparency</h3>
                  <p className="text-gray-600">
                    All transactions are recorded on a public ledger, providing
                    complete transparency and auditability for all parties.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium">Immutability</h3>
                  <p className="text-gray-600">
                    Once recorded on the blockchain, invoice records cannot be altered or deleted,
                    ensuring data integrity and preventing fraud.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium">Efficiency</h3>
                  <p className="text-gray-600">
                    Smart contracts automate payment verification and status updates,
                    reducing manual processes and potential errors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
