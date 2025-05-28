"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/firebase/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { InvoiceContractService, InvoiceData, InvoiceStatus } from '@/lib/blockchain/invoice-contract';
import { WalletService, WalletData } from '@/lib/blockchain/wallet-service';
import { BlockchainNetwork, NETWORK_CONFIG } from '@/lib/blockchain/config';
import { ethers } from 'ethers';

export default function BlockchainInvoicePage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isViewingInvoice, setIsViewingInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [isWalletUnlocked, setIsWalletUnlocked] = useState(false);
  
  // Form states
  const [recipientAddress, setRecipientAddress] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [invoiceDescription, setInvoiceDescription] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<Array<{ description: string; amount: string }>>([
    { description: '', amount: '' },
  ]);
  
  // Services
  const walletService = new WalletService();
  const invoiceService = new InvoiceContractService();
  
  // Load wallets and check if selected wallet is unlocked
  useEffect(() => {
    if (!loading && user) {
      loadWallets();
    }
  }, [user, loading]);
  
  // Load invoices when wallet is selected
  useEffect(() => {
    if (selectedWallet) {
      loadInvoices();
      checkWalletUnlocked();
    }
  }, [selectedWallet]);
  
  // Load wallets for the current user
  const loadWallets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userWallets = await walletService.getUserWallets(user?.uid || '');
      setWallets(userWallets);
      
      if (userWallets.length > 0) {
        setSelectedWallet(userWallets[0]);
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
      setError('Failed to load wallets. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if wallet is unlocked
  const checkWalletUnlocked = () => {
    if (!selectedWallet?.id) return;
    
    const unlocked = walletService.isWalletUnlocked(selectedWallet.id);
    setIsWalletUnlocked(unlocked);
  };
  
  // Load invoices for the selected wallet
  const loadInvoices = async () => {
    if (!selectedWallet) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get invoices issued by the wallet address
      const invoiceIds = await invoiceService.getInvoicesByIssuer(
        selectedWallet.address,
        selectedWallet.network
      );
      
      // Get invoice details
      const invoiceDetails = await invoiceService.getInvoicesByIds(
        invoiceIds,
        selectedWallet.network
      );
      
      setInvoices(invoiceDetails);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setError('Failed to load invoices. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle wallet selection
  const handleSelectWallet = (wallet: WalletData) => {
    setSelectedWallet(wallet);
  };
  
  // Handle invoice creation
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWallet?.id || !isWalletUnlocked) {
      router.push('/blockchain/wallet');
      return;
    }
    
    try {
      setError(null);
      
      // Validate form
      if (!recipientAddress || !invoiceAmount || !invoiceDueDate) {
        setError('All fields are required');
        return;
      }
      
      // Validate recipient address
      if (!ethers.utils.isAddress(recipientAddress)) {
        setError('Invalid recipient address');
        return;
      }
      
      // Calculate total amount
      const totalAmount = invoiceItems.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0
      );
      
      // Convert amount to wei
      const amountInWei = ethers.utils.parseEther(invoiceAmount).toString();
      
      // Create invoice data for IPFS
      const invoiceData = {
        description: invoiceDescription,
        items: invoiceItems.filter(item => item.description && item.amount),
        totalAmount,
        issuerName: user?.displayName || 'Unknown',
        issuerEmail: user?.email || 'Unknown',
        createdAt: new Date().toISOString(),
      };
      
      // Create invoice on blockchain
      const result = await invoiceService.createInvoice(
        selectedWallet.id,
        recipientAddress,
        amountInWei,
        new Date(invoiceDueDate),
        invoiceData,
        selectedWallet.network
      );
      
      // Reset form
      setRecipientAddress('');
      setInvoiceAmount('');
      setInvoiceDueDate('');
      setInvoiceDescription('');
      setInvoiceItems([{ description: '', amount: '' }]);
      setIsCreatingInvoice(false);
      
      // Reload invoices
      loadInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError('Failed to create invoice. Please try again later.');
    }
  };
  
  // Handle invoice payment
  const handlePayInvoice = async (invoice: InvoiceData) => {
    if (!selectedWallet?.id || !isWalletUnlocked) {
      router.push('/blockchain/wallet');
      return;
    }
    
    try {
      setError(null);
      
      // Pay invoice on blockchain
      await invoiceService.payInvoice(
        selectedWallet.id,
        invoice.id,
        invoice.amount,
        selectedWallet.network
      );
      
      // Reload invoices
      loadInvoices();
    } catch (error) {
      console.error('Error paying invoice:', error);
      setError('Failed to pay invoice. Please try again later.');
    }
  };
  
  // Handle invoice cancellation
  const handleCancelInvoice = async (invoice: InvoiceData) => {
    if (!selectedWallet?.id || !isWalletUnlocked) {
      router.push('/blockchain/wallet');
      return;
    }
    
    if (!confirm('Are you sure you want to cancel this invoice? This action cannot be undone.')) {
      return;
    }
    
    try {
      setError(null);
      
      // Cancel invoice on blockchain
      await invoiceService.cancelInvoice(
        selectedWallet.id,
        invoice.id,
        selectedWallet.network
      );
      
      // Reload invoices
      loadInvoices();
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      setError('Failed to cancel invoice. Please try again later.');
    }
  };
  
  // Add invoice item
  const handleAddInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { description: '', amount: '' }]);
  };
  
  // Update invoice item
  const handleUpdateInvoiceItem = (index: number, field: 'description' | 'amount', value: string) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index][field] = value;
    setInvoiceItems(updatedItems);
  };
  
  // Remove invoice item
  const handleRemoveInvoiceItem = (index: number) => {
    if (invoiceItems.length === 1) {
      return;
    }
    
    const updatedItems = [...invoiceItems];
    updatedItems.splice(index, 1);
    setInvoiceItems(updatedItems);
  };
  
  // Format currency
  const formatCurrency = (amount: string) => {
    try {
      return parseFloat(ethers.utils.formatEther(amount)).toFixed(4);
    } catch (error) {
      return '0.0000';
    }
  };
  
  // Get status label
  const getStatusLabel = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PENDING:
        return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      case InvoiceStatus.PAID:
        return { text: 'Paid', color: 'bg-green-100 text-green-800' };
      case InvoiceStatus.CANCELLED:
        return { text: 'Cancelled', color: 'bg-red-100 text-red-800' };
      case InvoiceStatus.OVERDUE:
        return { text: 'Overdue', color: 'bg-orange-100 text-orange-800' };
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get network name
  const getNetworkName = (network: BlockchainNetwork) => {
    return NETWORK_CONFIG[network]?.name || network;
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Blockchain Invoices</h1>
        <p className="text-gray-600 mb-6">
          Create and manage invoices on the blockchain with immutable records and secure payments.
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {!isWalletUnlocked && selectedWallet && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Your wallet is locked. Please <a href="/blockchain/wallet" className="underline">unlock your wallet</a> to create or manage invoices.
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Wallet Selector */}
          <div className="md:col-span-1">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Wallet
            </label>
            <select
              value={selectedWallet?.id || ''}
              onChange={(e) => {
                const wallet = wallets.find(w => w.id === e.target.value);
                if (wallet) {
                  handleSelectWallet(wallet);
                }
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select a wallet</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} ({getNetworkName(wallet.network)})
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            {selectedWallet && (
              <div>
                <div className="text-sm text-gray-500 mb-2">Wallet Address</div>
                <div className="font-mono text-sm break-all bg-gray-100 p-2 rounded">
                  {selectedWallet.address}
                </div>
              </div>
            )}
          </div>
          
          <div className="md:col-span-1 flex items-end">
            <button
              onClick={() => setIsCreatingInvoice(true)}
              disabled={!selectedWallet || !isWalletUnlocked}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full disabled:opacity-50"
            >
              Create New Invoice
            </button>
          </div>
        </div>
        
        {/* Invoice List */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold">Your Invoices</h2>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 border-b border-gray-200 bg-gray-50"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const status = getStatusLabel(invoice.status);
                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 border-b border-gray-200">
                          #{invoice.id}
                        </td>
                        <td className="py-3 px-4 border-b border-gray-200 font-mono text-sm">
                          {invoice.recipient.slice(0, 8)}...{invoice.recipient.slice(-6)}
                        </td>
                        <td className="py-3 px-4 border-b border-gray-200">
                          {formatCurrency(invoice.amount)} ETH
                        </td>
                        <td className="py-3 px-4 border-b border-gray-200">
                          {formatDate(invoice.dueDate)}
                        </td>
                        <td className="py-3 px-4 border-b border-gray-200">
                          <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b border-gray-200 text-right">
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsViewingInvoice(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 mr-3"
                          >
                            View
                          </button>
                          {invoice.status === InvoiceStatus.PENDING && (
                            <button
                              onClick={() => handleCancelInvoice(invoice)}
                              disabled={!isWalletUnlocked}
                              className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {selectedWallet ? (
                <p>No invoices found. Create a new invoice to get started.</p>
              ) : (
                <p>Select a wallet to view invoices.</p>
              )}
            </div>
          )}
        </div>
        
        {/* Create Invoice Modal */}
        {isCreatingInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Create New Invoice</h2>
              
              <form onSubmit={handleCreateInvoice}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="0x..."
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Total Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={invoiceDueDate}
                    onChange={(e) => setInvoiceDueDate(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    value={invoiceDescription}
                    onChange={(e) => setInvoiceDescription(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={3}
                    placeholder="Invoice description..."
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 text-sm font-bold">
                      Invoice Items
                    </label>
                    <button
                      type="button"
                      onClick={handleAddInvoiceItem}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      + Add Item
                    </button>
                  </div>
                  
                  {invoiceItems.map((item, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleUpdateInvoiceItem(index, 'description', e.target.value)}
                        className="shadow appearance-none border rounded w-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Item description"
                      />
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={item.amount}
                        onChange={(e) => handleUpdateInvoiceItem(index, 'amount', e.target.value)}
                        className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="0.00"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveInvoiceItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCreatingInvoice(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    Create Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* View Invoice Modal */}
        {isViewingInvoice && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Invoice #{selectedInvoice.id}</h2>
                <button
                  onClick={() => setIsViewingInvoice(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500">Issuer</div>
                  <div className="font-medium break-all">{selectedInvoice.issuer}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Recipient</div>
                  <div className="font-medium break-all">{selectedInvoice.recipient}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Amount</div>
                  <div className="font-medium">{formatCurrency(selectedInvoice.amount)} ETH</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Due Date</div>
                  <div className="font-medium">{formatDate(selectedInvoice.dueDate)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-medium">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusLabel(selectedInvoice.status).color}`}>
                      {getStatusLabel(selectedInvoice.status).text}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">IPFS Hash</div>
                  <div className="font-medium break-all">{selectedInvoice.ipfsHash}</div>
                </div>
              </div>
              
              {selectedInvoice.metadata && (
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-2">Description</div>
                  <div className="bg-gray-50 p-3 rounded">
                    {selectedInvoice.metadata.description}
                  </div>
                </div>
              )}
              
              {selectedInvoice.metadata?.items && selectedInvoice.metadata.items.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-2">Items</div>
                  <div className="bg-gray-50 p-3 rounded">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.metadata.items.map((item: any, index: number) => (
                          <tr key={index}>
                            <td className="py-2">{item.description}</td>
                            <td className="py-2 text-right">{item.amount} ETH</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <a
                  href={invoiceService.getTransactionExplorerUrl(
                    selectedInvoice.transactionHash || '',
                    selectedWallet?.network || BlockchainNetwork.ETHEREUM_MAINNET
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                >
                  View on Explorer
                </a>
                
                {selectedInvoice.status === InvoiceStatus.PENDING && (
                  <>
                    <button
                      onClick={() => {
                        setIsViewingInvoice(false);
                        handleCancelInvoice(selectedInvoice);
                      }}
                      disabled={!isWalletUnlocked}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                    >
                      Cancel Invoice
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsViewingInvoice(false);
                        handlePayInvoice(selectedInvoice);
                      }}
                      disabled={!isWalletUnlocked}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                    >
                      Pay Invoice
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
