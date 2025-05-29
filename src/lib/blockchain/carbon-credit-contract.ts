import { ethers } from 'ethers';
import { BlockchainProvider } from './provider';
import { BlockchainNetwork } from './config';
import { IpfsService } from './ipfs-service';

// ABI for carbon credit contract
const CarbonCreditABI = [
  // Function to verify a carbon credit
  'function verifyCarbonCredit(string creditId, string metadataUri) external returns (string)',
  // Function to retire a carbon credit
  'function retireCredit(string verificationId) external',
  // Function to get verification status
  'function getVerificationStatus(string verificationId) external view returns (uint8, address, uint256)',
  // Event emitted when a credit is verified
  'event CreditVerified(string indexed verificationId, string creditId, address verifier)',
  // Event emitted when a credit is retired
  'event CreditRetired(string indexed verificationId, address indexed owner)'
];

export enum VerificationStatus {
  UNVERIFIED = 0,
  VERIFIED = 1,
  RETIRED = 2
}

export interface VerificationResult {
  status: VerificationStatus;
  owner: string;
  timestamp: number;
}

/**
 * Class for interacting with the carbon credit verification contract
 */
export class CarbonCreditContract {
  private contract: ethers.Contract;
  private provider: ethers.providers.Provider;
  private ipfsService: IpfsService;
  
  /**
   * Constructor
   * @param contractAddress Contract address
   * @param network Blockchain network
   */
  constructor(
    private contractAddress: string, 
    private network: BlockchainNetwork = BlockchainNetwork.POLYGON_MAINNET
  ) {
    const blockchainProvider = BlockchainProvider.getInstance();
    this.provider = blockchainProvider.getEthereumProvider(network);
    this.contract = new ethers.Contract(contractAddress, CarbonCreditABI, this.provider);
    this.ipfsService = new IpfsService();
  }
  
  /**
   * Verify a carbon credit on the blockchain
   * @param creditId Credit ID
   * @param metadata Metadata for the credit
   * @returns Verification ID
   */
  async verifyCarbonCredit(creditId: string, metadata: any): Promise<string> {
    try {
      // Store metadata on IPFS
      const metadataUri = await this.ipfsService.storeJson(metadata);
      
      // Get signer
      const wallet = this.getWallet();
      const contractWithSigner = this.contract.connect(wallet);
      
      // Call contract function
      const tx = await contractWithSigner.verifyCarbonCredit(creditId, metadataUri);
      const receipt = await tx.wait();
      
      // Get verification ID from event
      const event = receipt.events?.find(e => e.event === 'CreditVerified');
      if (!event) {
        throw new Error('Verification event not found in transaction receipt');
      }
      
      return event.args.verificationId;
    } catch (error) {
      console.error('Error verifying carbon credit on blockchain:', error);
      throw new Error('Failed to verify carbon credit on blockchain');
    }
  }
  
  /**
   * Retire a carbon credit
   * @param verificationId Verification ID
   */
  async retireCredit(verificationId: string): Promise<void> {
    try {
      // Get signer
      const wallet = this.getWallet();
      const contractWithSigner = this.contract.connect(wallet);
      
      // Call contract function
      const tx = await contractWithSigner.retireCredit(verificationId);
      await tx.wait();
    } catch (error) {
      console.error('Error retiring carbon credit on blockchain:', error);
      throw new Error('Failed to retire carbon credit on blockchain');
    }
  }
  
  /**
   * Get verification status
   * @param verificationId Verification ID
   * @returns Verification status
   */
  async getVerificationStatus(verificationId: string): Promise<VerificationResult> {
    try {
      // Call contract function
      const [status, owner, timestamp] = await this.contract.getVerificationStatus(verificationId);
      
      return {
        status,
        owner,
        timestamp: timestamp.toNumber()
      };
    } catch (error) {
      console.error('Error getting verification status:', error);
      throw new Error('Failed to get verification status');
    }
  }
  
  /**
   * Get wallet for signing transactions
   * @returns Ethers wallet
   */
  private getWallet(): ethers.Wallet {
    // In a real implementation, this would use a secure method to access the private key
    // For development, we'll use an environment variable
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error('Blockchain private key not found in environment variables');
    }
    
    return new ethers.Wallet(privateKey, this.provider);
  }
}
