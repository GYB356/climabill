"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/firebase/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { WalletService, WalletData } from '@/lib/blockchain/wallet-service';
import { BlockchainNetwork, NETWORK_CONFIG } from '@/lib/blockchain/config';

export default function WalletManagementPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isImportingWallet, setIsImportingWallet] = useState(false);
  const [isUnlockingWallet, setIsUnlockingWallet] = useState(false);
  
  // Form states
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletNetwork, setNewWalletNetwork] = useState<BlockchainNetwork>(BlockchainNetwork.ETHEREUM_MAINNET);
  const [newWalletPassword, setNewWalletPassword] = useState('');
  const [newWalletConfirmPassword, setNewWalletConfirmPassword] = useState('');
  const [importType, setImportType] = useState<'privateKey' | 'mnemonic'>('mnemonic');
  const [importValue, setImportValue] = useState('');
  const [unlockPassword, setUnlockPassword] = useState('');
  
  // Wallet service instance
  const walletService = new WalletService();
  
  // Load wallets when component mounts
  useEffect(() => {
    if (!loading && user) {
      loadWallets();
    }
  }, [user, loading]);
  
  // Load wallets for the current user
  const loadWallets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userWallets = await walletService.getUserWallets(user?.uid || '');
      setWallets(userWallets);
      
      if (userWallets.length > 0 && !selectedWallet) {
        setSelectedWallet(userWallets[0]);
        loadWalletBalance(userWallets[0]);
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
      setError('Failed to load wallets. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load wallet balance
  const loadWalletBalance = async (wallet: WalletData) => {
    try {
      const balance = await walletService.getWalletBalance(wallet.id || '');
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
      setWalletBalance(null);
    }
  };
  
  // Handle wallet selection
  const handleSelectWallet = (wallet: WalletData) => {
    setSelectedWallet(wallet);
    loadWalletBalance(wallet);
  };
  
  // Create a new wallet
  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      // Validate form
      if (!newWalletName) {
        setError('Wallet name is required');
        return;
      }
      
      if (newWalletPassword !== newWalletConfirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (newWalletPassword.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      
      // Create wallet
      const isPolkadot = newWalletNetwork === BlockchainNetwork.POLKADOT || 
                         newWalletNetwork === BlockchainNetwork.KUSAMA;
      
      let newWallet: WalletData;
      
      if (isPolkadot) {
        newWallet = await walletService.createPolkadotWallet(
          user?.uid || '',
          newWalletName,
          newWalletPassword,
          newWalletNetwork
        );
      } else {
        newWallet = await walletService.createEthereumWallet(
          user?.uid || '',
          newWalletName,
          newWalletPassword,
          newWalletNetwork
        );
      }
      
      // Update state
      setWallets([...wallets, newWallet]);
      setSelectedWallet(newWallet);
      loadWalletBalance(newWallet);
      
      // Reset form
      setNewWalletName('');
      setNewWalletPassword('');
      setNewWalletConfirmPassword('');
      setIsCreatingWallet(false);
    } catch (error) {
      console.error('Error creating wallet:', error);
      setError('Failed to create wallet. Please try again later.');
    }
  };
  
  // Import a wallet
  const handleImportWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      // Validate form
      if (!newWalletName) {
        setError('Wallet name is required');
        return;
      }
      
      if (!importValue) {
        setError(`${importType === 'privateKey' ? 'Private key' : 'Mnemonic phrase'} is required`);
        return;
      }
      
      if (newWalletPassword !== newWalletConfirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (newWalletPassword.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      
      // Import wallet
      const isPolkadot = newWalletNetwork === BlockchainNetwork.POLKADOT || 
                         newWalletNetwork === BlockchainNetwork.KUSAMA;
      
      let newWallet: WalletData;
      
      if (isPolkadot) {
        if (importType === 'privateKey') {
          setError('Private key import is not supported for Polkadot wallets');
          return;
        }
        
        newWallet = await walletService.importPolkadotWalletFromMnemonic(
          user?.uid || '',
          newWalletName,
          importValue,
          newWalletPassword,
          newWalletNetwork
        );
      } else {
        if (importType === 'privateKey') {
          newWallet = await walletService.importEthereumWalletFromPrivateKey(
            user?.uid || '',
            newWalletName,
            importValue,
            newWalletPassword,
            newWalletNetwork
          );
        } else {
          newWallet = await walletService.importEthereumWalletFromMnemonic(
            user?.uid || '',
            newWalletName,
            importValue,
            newWalletPassword,
            newWalletNetwork
          );
        }
      }
      
      // Update state
      setWallets([...wallets, newWallet]);
      setSelectedWallet(newWallet);
      loadWalletBalance(newWallet);
      
      // Reset form
      setNewWalletName('');
      setImportValue('');
      setNewWalletPassword('');
      setNewWalletConfirmPassword('');
      setIsImportingWallet(false);
    } catch (error) {
      console.error('Error importing wallet:', error);
      setError('Failed to import wallet. Please check your input and try again.');
    }
  };
  
  // Unlock wallet
  const handleUnlockWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWallet) {
      return;
    }
    
    try {
      setError(null);
      
      if (selectedWallet.isPolkadot) {
        await walletService.unlockPolkadotWallet(
          selectedWallet.id || '',
          unlockPassword
        );
      } else {
        await walletService.unlockEthereumWallet(
          selectedWallet.id || '',
          unlockPassword
        );
      }
      
      // Reset form
      setUnlockPassword('');
      setIsUnlockingWallet(false);
      
      // Redirect to invoice page
      router.push('/blockchain/invoice');
    } catch (error) {
      console.error('Error unlocking wallet:', error);
      setError('Failed to unlock wallet. Please check your password and try again.');
    }
  };
  
  // Delete wallet
  const handleDeleteWallet = async (walletId: string) => {
    if (!confirm('Are you sure you want to delete this wallet? This action cannot be undone.')) {
      return;
    }
    
    try {
      await walletService.deleteWallet(walletId);
      
      // Update state
      const updatedWallets = wallets.filter(w => w.id !== walletId);
      setWallets(updatedWallets);
      
      if (selectedWallet?.id === walletId) {
        if (updatedWallets.length > 0) {
          setSelectedWallet(updatedWallets[0]);
          loadWalletBalance(updatedWallets[0]);
        } else {
          setSelectedWallet(null);
          setWalletBalance(null);
        }
      }
    } catch (error) {
      console.error('Error deleting wallet:', error);
      setError('Failed to delete wallet. Please try again later.');
    }
  };
  
  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (address.length <= 12) {
      return address;
    }
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };
  
  // Get network name
  const getNetworkName = (network: BlockchainNetwork) => {
    return NETWORK_CONFIG[network]?.name || network;
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Blockchain Wallet Management</h1>
        <p className="text-gray-600 mb-6">
          Create, import, and manage your blockchain wallets for invoice management.
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wallet List */}
          <div className="md:col-span-1 bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Wallets</h2>
              <div className="space-x-2">
                <button
                  onClick={() => setIsCreatingWallet(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  Create
                </button>
                <button
                  onClick={() => setIsImportingWallet(true)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  Import
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : wallets.length > 0 ? (
              <div className="space-y-3">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className={`p-3 rounded-md cursor-pointer ${
                      selectedWallet?.id === wallet.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleSelectWallet(wallet)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{wallet.name}</h3>
                        <p className="text-sm text-gray-500">{formatAddress(wallet.address)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWallet(wallet.id || '');
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {getNetworkName(wallet.network)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No wallets found. Create or import a wallet to get started.</p>
              </div>
            )}
          </div>
          
          {/* Wallet Details */}
          <div className="md:col-span-2 bg-white shadow-md rounded-lg p-6">
            {selectedWallet ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Wallet Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-medium">{selectedWallet.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Network</div>
                    <div className="font-medium">{getNetworkName(selectedWallet.network)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="font-medium break-all">{selectedWallet.address}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Balance</div>
                    <div className="font-medium">
                      {walletBalance !== null ? (
                        <>
                          {walletBalance} {NETWORK_CONFIG[selectedWallet.network]?.nativeCurrency.symbol}
                        </>
                      ) : (
                        <span className="text-gray-400">Loading...</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Type</div>
                    <div className="font-medium">
                      {selectedWallet.isPolkadot ? 'Polkadot' : 'Ethereum'} {selectedWallet.isImported ? '(Imported)' : '(Created)'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Created</div>
                    <div className="font-medium">
                      {new Date(selectedWallet.createdAt.toString()).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsUnlockingWallet(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                  >
                    Use Wallet for Invoices
                  </button>
                  <button
                    onClick={() => router.push('/blockchain/invoice')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    View Blockchain Invoices
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Select a wallet to view details</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Create Wallet Modal */}
        {isCreatingWallet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Create New Wallet</h2>
              
              <form onSubmit={handleCreateWallet}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Wallet Name
                  </label>
                  <input
                    type="text"
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="My Wallet"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Blockchain Network
                  </label>
                  <select
                    value={newWalletNetwork}
                    onChange={(e) => setNewWalletNetwork(e.target.value as BlockchainNetwork)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    {Object.entries(NETWORK_CONFIG).map(([network, config]) => (
                      <option key={network} value={network}>
                        {config.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newWalletPassword}
                    onChange={(e) => setNewWalletPassword(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="********"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters long
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={newWalletConfirmPassword}
                    onChange={(e) => setNewWalletConfirmPassword(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="********"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCreatingWallet(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    Create Wallet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Import Wallet Modal */}
        {isImportingWallet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Import Wallet</h2>
              
              <form onSubmit={handleImportWallet}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Wallet Name
                  </label>
                  <input
                    type="text"
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="My Imported Wallet"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Blockchain Network
                  </label>
                  <select
                    value={newWalletNetwork}
                    onChange={(e) => setNewWalletNetwork(e.target.value as BlockchainNetwork)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    {Object.entries(NETWORK_CONFIG).map(([network, config]) => (
                      <option key={network} value={network}>
                        {config.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Import Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={importType === 'mnemonic'}
                        onChange={() => setImportType('mnemonic')}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">Mnemonic Phrase</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={importType === 'privateKey'}
                        onChange={() => setImportType('privateKey')}
                        className="form-radio h-4 w-4 text-blue-600"
                        disabled={newWalletNetwork === BlockchainNetwork.POLKADOT || newWalletNetwork === BlockchainNetwork.KUSAMA}
                      />
                      <span className="ml-2 text-gray-700">Private Key</span>
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    {importType === 'mnemonic' ? 'Mnemonic Phrase' : 'Private Key'}
                  </label>
                  <textarea
                    value={importValue}
                    onChange={(e) => setImportValue(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={3}
                    placeholder={importType === 'mnemonic' ? 'Enter your 12 or 24 word mnemonic phrase' : 'Enter your private key'}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newWalletPassword}
                    onChange={(e) => setNewWalletPassword(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="********"
                    required
                    minLength={8}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={newWalletConfirmPassword}
                    onChange={(e) => setNewWalletConfirmPassword(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="********"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsImportingWallet(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    Import Wallet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Unlock Wallet Modal */}
        {isUnlockingWallet && selectedWallet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Unlock Wallet</h2>
              
              <form onSubmit={handleUnlockWallet}>
                <div className="mb-4">
                  <p className="text-gray-700 mb-4">
                    Enter your password to unlock <strong>{selectedWallet.name}</strong> for invoice operations.
                  </p>
                  
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={unlockPassword}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="********"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsUnlockingWallet(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                  >
                    Unlock Wallet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
