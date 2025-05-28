import { ethers } from 'ethers';
import { Keyring } from '@polkadot/keyring';
import { mnemonicGenerate, mnemonicValidate } from '@polkadot/util-crypto';
import { encryptKeystoreJson, decryptKeystoreJson } from 'ethers/lib/utils';
import { BlockchainNetwork, WALLET_CONFIG } from './config';
import { BlockchainProvider } from './provider';
import { firestore } from '../firebase/config';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  deleteDoc
} from 'firebase/firestore';

/**
 * Interface for wallet data
 */
export interface WalletData {
  id?: string;
  userId: string;
  name: string;
  address: string;
  network: BlockchainNetwork;
  encryptedJson?: string;
  publicKey?: string;
  isImported: boolean;
  isPolkadot: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Service for managing blockchain wallets
 */
export class WalletService {
  private provider: BlockchainProvider;
  private readonly WALLET_COLLECTION = 'blockchainWallets';
  private readonly SESSION_STORAGE_KEY = 'climabill_wallet_session';
  
  constructor() {
    this.provider = BlockchainProvider.getInstance();
  }
  
  /**
   * Create a new Ethereum wallet
   * @param userId User ID
   * @param name Wallet name
   * @param password Password for encrypting the wallet
   * @param network Blockchain network
   * @returns Created wallet data
   */
  async createEthereumWallet(
    userId: string,
    name: string,
    password: string,
    network: BlockchainNetwork = BlockchainNetwork.ETHEREUM_MAINNET
  ): Promise<WalletData> {
    try {
      // Generate random wallet
      const wallet = ethers.Wallet.createRandom();
      
      // Encrypt wallet with password
      const encryptedJson = await wallet.encrypt(password, {
        scrypt: {
          N: WALLET_CONFIG.encryptionLevel === 'high' ? 131072 : 8192,
        },
      });
      
      // Create wallet data
      const now = Timestamp.now();
      const walletData: Omit<WalletData, 'id'> = {
        userId,
        name,
        address: wallet.address,
        network,
        encryptedJson,
        publicKey: wallet.publicKey,
        isImported: false,
        isPolkadot: false,
        createdAt: now,
        updatedAt: now,
      };
      
      // Save to Firestore
      const docRef = await addDoc(collection(firestore, this.WALLET_COLLECTION), walletData);
      
      return {
        ...walletData,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error creating Ethereum wallet:', error);
      throw error;
    }
  }
  
  /**
   * Create a new Polkadot wallet
   * @param userId User ID
   * @param name Wallet name
   * @param password Password for encrypting the wallet
   * @param network Blockchain network
   * @returns Created wallet data
   */
  async createPolkadotWallet(
    userId: string,
    name: string,
    password: string,
    network: BlockchainNetwork = BlockchainNetwork.POLKADOT
  ): Promise<WalletData> {
    try {
      // Generate mnemonic
      const mnemonic = mnemonicGenerate();
      
      // Create keyring
      const keyring = new Keyring({ type: 'sr25519' });
      
      // Add account from mnemonic
      const pair = keyring.addFromMnemonic(mnemonic);
      
      // Get address and public key
      const address = pair.address;
      const publicKey = Buffer.from(pair.publicKey).toString('hex');
      
      // Encrypt mnemonic with password
      const encryptedJson = await encryptKeystoreJson(
        { mnemonic, address, publicKey },
        password,
        {
          scrypt: {
            N: WALLET_CONFIG.encryptionLevel === 'high' ? 131072 : 8192,
          },
        }
      );
      
      // Create wallet data
      const now = Timestamp.now();
      const walletData: Omit<WalletData, 'id'> = {
        userId,
        name,
        address,
        network,
        encryptedJson: JSON.stringify(encryptedJson),
        publicKey,
        isImported: false,
        isPolkadot: true,
        createdAt: now,
        updatedAt: now,
      };
      
      // Save to Firestore
      const docRef = await addDoc(collection(firestore, this.WALLET_COLLECTION), walletData);
      
      return {
        ...walletData,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error creating Polkadot wallet:', error);
      throw error;
    }
  }
  
  /**
   * Import an Ethereum wallet from private key
   * @param userId User ID
   * @param name Wallet name
   * @param privateKey Private key
   * @param password Password for encrypting the wallet
   * @param network Blockchain network
   * @returns Imported wallet data
   */
  async importEthereumWalletFromPrivateKey(
    userId: string,
    name: string,
    privateKey: string,
    password: string,
    network: BlockchainNetwork = BlockchainNetwork.ETHEREUM_MAINNET
  ): Promise<WalletData> {
    try {
      // Create wallet from private key
      const wallet = new ethers.Wallet(privateKey);
      
      // Encrypt wallet with password
      const encryptedJson = await wallet.encrypt(password, {
        scrypt: {
          N: WALLET_CONFIG.encryptionLevel === 'high' ? 131072 : 8192,
        },
      });
      
      // Create wallet data
      const now = Timestamp.now();
      const walletData: Omit<WalletData, 'id'> = {
        userId,
        name,
        address: wallet.address,
        network,
        encryptedJson,
        publicKey: wallet.publicKey,
        isImported: true,
        isPolkadot: false,
        createdAt: now,
        updatedAt: now,
      };
      
      // Save to Firestore
      const docRef = await addDoc(collection(firestore, this.WALLET_COLLECTION), walletData);
      
      return {
        ...walletData,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error importing Ethereum wallet from private key:', error);
      throw error;
    }
  }
  
  /**
   * Import an Ethereum wallet from mnemonic
   * @param userId User ID
   * @param name Wallet name
   * @param mnemonic Mnemonic phrase
   * @param password Password for encrypting the wallet
   * @param network Blockchain network
   * @returns Imported wallet data
   */
  async importEthereumWalletFromMnemonic(
    userId: string,
    name: string,
    mnemonic: string,
    password: string,
    network: BlockchainNetwork = BlockchainNetwork.ETHEREUM_MAINNET
  ): Promise<WalletData> {
    try {
      // Create wallet from mnemonic
      const wallet = ethers.Wallet.fromMnemonic(
        mnemonic,
        WALLET_CONFIG.defaultDerivationPath
      );
      
      // Encrypt wallet with password
      const encryptedJson = await wallet.encrypt(password, {
        scrypt: {
          N: WALLET_CONFIG.encryptionLevel === 'high' ? 131072 : 8192,
        },
      });
      
      // Create wallet data
      const now = Timestamp.now();
      const walletData: Omit<WalletData, 'id'> = {
        userId,
        name,
        address: wallet.address,
        network,
        encryptedJson,
        publicKey: wallet.publicKey,
        isImported: true,
        isPolkadot: false,
        createdAt: now,
        updatedAt: now,
      };
      
      // Save to Firestore
      const docRef = await addDoc(collection(firestore, this.WALLET_COLLECTION), walletData);
      
      return {
        ...walletData,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error importing Ethereum wallet from mnemonic:', error);
      throw error;
    }
  }
  
  /**
   * Import a Polkadot wallet from mnemonic
   * @param userId User ID
   * @param name Wallet name
   * @param mnemonic Mnemonic phrase
   * @param password Password for encrypting the wallet
   * @param network Blockchain network
   * @returns Imported wallet data
   */
  async importPolkadotWalletFromMnemonic(
    userId: string,
    name: string,
    mnemonic: string,
    password: string,
    network: BlockchainNetwork = BlockchainNetwork.POLKADOT
  ): Promise<WalletData> {
    try {
      // Validate mnemonic
      if (!mnemonicValidate(mnemonic)) {
        throw new Error('Invalid mnemonic phrase');
      }
      
      // Create keyring
      const keyring = new Keyring({ type: 'sr25519' });
      
      // Add account from mnemonic
      const pair = keyring.addFromMnemonic(mnemonic);
      
      // Get address and public key
      const address = pair.address;
      const publicKey = Buffer.from(pair.publicKey).toString('hex');
      
      // Encrypt mnemonic with password
      const encryptedJson = await encryptKeystoreJson(
        { mnemonic, address, publicKey },
        password,
        {
          scrypt: {
            N: WALLET_CONFIG.encryptionLevel === 'high' ? 131072 : 8192,
          },
        }
      );
      
      // Create wallet data
      const now = Timestamp.now();
      const walletData: Omit<WalletData, 'id'> = {
        userId,
        name,
        address,
        network,
        encryptedJson: JSON.stringify(encryptedJson),
        publicKey,
        isImported: true,
        isPolkadot: true,
        createdAt: now,
        updatedAt: now,
      };
      
      // Save to Firestore
      const docRef = await addDoc(collection(firestore, this.WALLET_COLLECTION), walletData);
      
      return {
        ...walletData,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error importing Polkadot wallet from mnemonic:', error);
      throw error;
    }
  }
  
  /**
   * Get wallet by ID
   * @param walletId Wallet ID
   * @returns Wallet data or null if not found
   */
  async getWallet(walletId: string): Promise<WalletData | null> {
    try {
      const walletRef = doc(firestore, this.WALLET_COLLECTION, walletId);
      const walletSnap = await getDoc(walletRef);
      
      if (!walletSnap.exists()) {
        return null;
      }
      
      return {
        ...walletSnap.data(),
        id: walletSnap.id,
      } as WalletData;
    } catch (error) {
      console.error('Error getting wallet:', error);
      throw error;
    }
  }
  
  /**
   * Get wallets for a user
   * @param userId User ID
   * @returns List of wallet data
   */
  async getUserWallets(userId: string): Promise<WalletData[]> {
    try {
      const q = query(
        collection(firestore, this.WALLET_COLLECTION),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const wallets: WalletData[] = [];
      
      querySnapshot.forEach(doc => {
        wallets.push({
          ...doc.data(),
          id: doc.id,
        } as WalletData);
      });
      
      return wallets;
    } catch (error) {
      console.error('Error getting user wallets:', error);
      throw error;
    }
  }
  
  /**
   * Update wallet name
   * @param walletId Wallet ID
   * @param name New wallet name
   * @returns Updated wallet data
   */
  async updateWalletName(walletId: string, name: string): Promise<WalletData> {
    try {
      const walletRef = doc(firestore, this.WALLET_COLLECTION, walletId);
      const walletSnap = await getDoc(walletRef);
      
      if (!walletSnap.exists()) {
        throw new Error(`Wallet with ID ${walletId} not found`);
      }
      
      await updateDoc(walletRef, {
        name,
        updatedAt: Timestamp.now(),
      });
      
      const updatedWallet = await this.getWallet(walletId);
      
      if (!updatedWallet) {
        throw new Error(`Failed to get updated wallet with ID ${walletId}`);
      }
      
      return updatedWallet;
    } catch (error) {
      console.error('Error updating wallet name:', error);
      throw error;
    }
  }
  
  /**
   * Delete wallet
   * @param walletId Wallet ID
   */
  async deleteWallet(walletId: string): Promise<void> {
    try {
      const walletRef = doc(firestore, this.WALLET_COLLECTION, walletId);
      const walletSnap = await getDoc(walletRef);
      
      if (!walletSnap.exists()) {
        throw new Error(`Wallet with ID ${walletId} not found`);
      }
      
      await deleteDoc(walletRef);
    } catch (error) {
      console.error('Error deleting wallet:', error);
      throw error;
    }
  }
  
  /**
   * Unlock Ethereum wallet
   * @param walletId Wallet ID
   * @param password Password
   * @returns Unlocked wallet instance
   */
  async unlockEthereumWallet(
    walletId: string,
    password: string
  ): Promise<ethers.Wallet> {
    try {
      const wallet = await this.getWallet(walletId);
      
      if (!wallet) {
        throw new Error(`Wallet with ID ${walletId} not found`);
      }
      
      if (wallet.isPolkadot) {
        throw new Error('Cannot unlock Polkadot wallet as Ethereum wallet');
      }
      
      if (!wallet.encryptedJson) {
        throw new Error('Wallet does not have encrypted JSON');
      }
      
      // Decrypt wallet
      const decryptedWallet = await ethers.Wallet.fromEncryptedJson(
        wallet.encryptedJson,
        password
      );
      
      // Connect to provider
      const provider = this.provider.getEthereumProvider(wallet.network);
      const connectedWallet = decryptedWallet.connect(provider);
      
      // Store wallet in session for temporary access
      this.storeWalletInSession(walletId);
      
      return connectedWallet;
    } catch (error) {
      console.error('Error unlocking Ethereum wallet:', error);
      throw error;
    }
  }
  
  /**
   * Unlock Polkadot wallet
   * @param walletId Wallet ID
   * @param password Password
   * @returns Unlocked keyring pair
   */
  async unlockPolkadotWallet(
    walletId: string,
    password: string
  ): Promise<any> {
    try {
      const wallet = await this.getWallet(walletId);
      
      if (!wallet) {
        throw new Error(`Wallet with ID ${walletId} not found`);
      }
      
      if (!wallet.isPolkadot) {
        throw new Error('Cannot unlock Ethereum wallet as Polkadot wallet');
      }
      
      if (!wallet.encryptedJson) {
        throw new Error('Wallet does not have encrypted JSON');
      }
      
      // Parse encrypted JSON
      const encryptedJson = JSON.parse(wallet.encryptedJson);
      
      // Decrypt wallet
      const decrypted = await decryptKeystoreJson(encryptedJson, password);
      const mnemonic = decrypted.mnemonic;
      
      // Create keyring
      const keyring = new Keyring({ type: 'sr25519' });
      
      // Add account from mnemonic
      const pair = keyring.addFromMnemonic(mnemonic);
      
      // Store wallet in session for temporary access
      this.storeWalletInSession(walletId);
      
      return pair;
    } catch (error) {
      console.error('Error unlocking Polkadot wallet:', error);
      throw error;
    }
  }
  
  /**
   * Store wallet ID in session for temporary access
   * @param walletId Wallet ID
   */
  private storeWalletInSession(walletId: string): void {
    if (typeof window !== 'undefined') {
      const sessionData = {
        walletId,
        timestamp: Date.now(),
      };
      
      sessionStorage.setItem(
        this.SESSION_STORAGE_KEY,
        JSON.stringify(sessionData)
      );
      
      // Set auto-lock timeout
      setTimeout(() => {
        this.lockWallet();
      }, WALLET_CONFIG.autoLockTimeout);
    }
  }
  
  /**
   * Lock wallet by removing it from session
   */
  lockWallet(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
    }
  }
  
  /**
   * Check if a wallet is unlocked
   * @param walletId Wallet ID
   * @returns True if the wallet is unlocked
   */
  isWalletUnlocked(walletId: string): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const sessionDataStr = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
    
    if (!sessionDataStr) {
      return false;
    }
    
    try {
      const sessionData = JSON.parse(sessionDataStr);
      
      // Check if wallet ID matches
      if (sessionData.walletId !== walletId) {
        return false;
      }
      
      // Check if session has expired
      const now = Date.now();
      const elapsed = now - sessionData.timestamp;
      
      return elapsed < WALLET_CONFIG.autoLockTimeout;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get wallet balance
   * @param walletId Wallet ID
   * @returns Wallet balance in native currency
   */
  async getWalletBalance(walletId: string): Promise<string> {
    try {
      const wallet = await this.getWallet(walletId);
      
      if (!wallet) {
        throw new Error(`Wallet with ID ${walletId} not found`);
      }
      
      if (wallet.isPolkadot) {
        // Get Polkadot balance
        const api = this.provider.getPolkadotProvider(wallet.network);
        const { data: balance } = await api.query.system.account(wallet.address);
        
        // Format balance
        const formattedBalance = balance.free.toString();
        
        return formattedBalance;
      } else {
        // Get Ethereum balance
        const provider = this.provider.getEthereumProvider(wallet.network);
        const balance = await provider.getBalance(wallet.address);
        
        // Format balance in ether
        const formattedBalance = ethers.utils.formatEther(balance);
        
        return formattedBalance;
      }
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw error;
    }
  }
  
  /**
   * Export wallet mnemonic
   * @param walletId Wallet ID
   * @param password Password
   * @returns Mnemonic phrase
   */
  async exportWalletMnemonic(
    walletId: string,
    password: string
  ): Promise<string> {
    try {
      const wallet = await this.getWallet(walletId);
      
      if (!wallet) {
        throw new Error(`Wallet with ID ${walletId} not found`);
      }
      
      if (!wallet.encryptedJson) {
        throw new Error('Wallet does not have encrypted JSON');
      }
      
      if (wallet.isPolkadot) {
        // Decrypt Polkadot wallet
        const encryptedJson = JSON.parse(wallet.encryptedJson);
        const decrypted = await decryptKeystoreJson(encryptedJson, password);
        
        return decrypted.mnemonic;
      } else {
        // Decrypt Ethereum wallet
        const decryptedWallet = await ethers.Wallet.fromEncryptedJson(
          wallet.encryptedJson,
          password
        );
        
        // Check if wallet has mnemonic
        if (!decryptedWallet.mnemonic) {
          throw new Error('Wallet does not have a mnemonic phrase');
        }
        
        return decryptedWallet.mnemonic.phrase;
      }
    } catch (error) {
      console.error('Error exporting wallet mnemonic:', error);
      throw error;
    }
  }
  
  /**
   * Export wallet private key (Ethereum only)
   * @param walletId Wallet ID
   * @param password Password
   * @returns Private key
   */
  async exportWalletPrivateKey(
    walletId: string,
    password: string
  ): Promise<string> {
    try {
      const wallet = await this.getWallet(walletId);
      
      if (!wallet) {
        throw new Error(`Wallet with ID ${walletId} not found`);
      }
      
      if (wallet.isPolkadot) {
        throw new Error('Cannot export private key for Polkadot wallet');
      }
      
      if (!wallet.encryptedJson) {
        throw new Error('Wallet does not have encrypted JSON');
      }
      
      // Decrypt Ethereum wallet
      const decryptedWallet = await ethers.Wallet.fromEncryptedJson(
        wallet.encryptedJson,
        password
      );
      
      return decryptedWallet.privateKey;
    } catch (error) {
      console.error('Error exporting wallet private key:', error);
      throw error;
    }
  }
}
