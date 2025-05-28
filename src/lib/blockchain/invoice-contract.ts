import { ethers } from 'ethers';
import { BlockchainNetwork, CONTRACT_ADDRESSES, GAS_PRICE_CONFIG } from './config';
import { BlockchainProvider } from './provider';
import { WalletService } from './wallet-service';
import { IpfsService } from './ipfs-service';

// ABI for the invoice contract
const INVOICE_CONTRACT_ABI = [
  // Events
  "event InvoiceCreated(uint256 indexed invoiceId, address indexed issuer, address indexed recipient, uint256 amount, uint256 dueDate)",
  "event InvoicePaid(uint256 indexed invoiceId, address indexed payer, uint256 amount, uint256 paymentDate)",
  "event InvoiceCancelled(uint256 indexed invoiceId, address indexed canceller, uint256 cancellationDate)",
  "event InvoiceUpdated(uint256 indexed invoiceId, address indexed updater, string ipfsHash)",
  
  // View functions
  "function getInvoice(uint256 invoiceId) view returns (address issuer, address recipient, uint256 amount, uint256 dueDate, uint8 status, string memory ipfsHash)",
  "function getInvoiceCount() view returns (uint256)",
  "function getInvoicesByIssuer(address issuer) view returns (uint256[] memory)",
  "function getInvoicesByRecipient(address recipient) view returns (uint256[] memory)",
  
  // State-changing functions
  "function createInvoice(address recipient, uint256 amount, uint256 dueDate, string memory ipfsHash) returns (uint256)",
  "function payInvoice(uint256 invoiceId) payable",
  "function cancelInvoice(uint256 invoiceId)",
  "function updateInvoice(uint256 invoiceId, uint256 amount, uint256 dueDate, string memory ipfsHash)",
];

/**
 * Invoice status enum
 */
export enum InvoiceStatus {
  PENDING = 0,
  PAID = 1,
  CANCELLED = 2,
  OVERDUE = 3,
}

/**
 * Interface for invoice data
 */
export interface InvoiceData {
  id: number;
  issuer: string;
  recipient: string;
  amount: string;
  dueDate: Date;
  status: InvoiceStatus;
  ipfsHash: string;
  metadata?: any;
}

/**
 * Service for interacting with the invoice smart contract
 */
export class InvoiceContractService {
  private provider: BlockchainProvider;
  private walletService: WalletService;
  private ipfsService: IpfsService;
  
  constructor() {
    this.provider = BlockchainProvider.getInstance();
    this.walletService = new WalletService();
    this.ipfsService = new IpfsService();
  }
  
  /**
   * Get contract instance
   * @param network Blockchain network
   * @param walletId Optional wallet ID for signing transactions
   * @returns Contract instance
   */
  private async getContract(
    network: BlockchainNetwork,
    walletId?: string
  ): Promise<ethers.Contract> {
    // Get contract address for the network
    const contractAddress = CONTRACT_ADDRESSES[network]?.invoiceContract;
    
    if (!contractAddress) {
      throw new Error(`Invoice contract address not configured for network: ${network}`);
    }
    
    // Get provider
    const provider = this.provider.getEthereumProvider(network);
    
    // Create contract instance
    let contract: ethers.Contract;
    
    if (walletId) {
      // Get wallet for signing transactions
      const wallet = await this.walletService.unlockEthereumWallet(walletId, '');
      contract = new ethers.Contract(contractAddress, INVOICE_CONTRACT_ABI, wallet);
    } else {
      // Read-only contract
      contract = new ethers.Contract(contractAddress, INVOICE_CONTRACT_ABI, provider);
    }
    
    return contract;
  }
  
  /**
   * Create a new invoice on the blockchain
   * @param walletId Wallet ID for signing the transaction
   * @param recipientAddress Recipient address
   * @param amountInWei Amount in wei
   * @param dueDate Due date
   * @param invoiceData Invoice data to store on IPFS
   * @param network Blockchain network
   * @returns Transaction receipt and invoice ID
   */
  async createInvoice(
    walletId: string,
    recipientAddress: string,
    amountInWei: string,
    dueDate: Date,
    invoiceData: any,
    network: BlockchainNetwork
  ): Promise<{
    transactionHash: string;
    invoiceId: number;
    ipfsHash: string;
  }> {
    try {
      // Upload invoice data to IPFS
      const ipfsHash = await this.ipfsService.uploadJson(invoiceData);
      
      // Get contract instance
      const contract = await this.getContract(network, walletId);
      
      // Convert due date to timestamp
      const dueDateTimestamp = Math.floor(dueDate.getTime() / 1000);
      
      // Estimate gas
      const gasEstimate = await contract.estimateGas.createInvoice(
        recipientAddress,
        amountInWei,
        dueDateTimestamp,
        ipfsHash
      );
      
      // Apply gas multiplier
      const gasLimit = Math.floor(
        Number(gasEstimate.toString()) * GAS_PRICE_CONFIG.gasMultiplier
      );
      
      // Create invoice
      const tx = await contract.createInvoice(
        recipientAddress,
        amountInWei,
        dueDateTimestamp,
        ipfsHash,
        {
          gasLimit,
        }
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Find InvoiceCreated event
      const event = receipt.events?.find(
        (e: any) => e.event === 'InvoiceCreated'
      );
      
      if (!event) {
        throw new Error('InvoiceCreated event not found in transaction receipt');
      }
      
      // Get invoice ID from event
      const invoiceId = event.args.invoiceId.toNumber();
      
      return {
        transactionHash: receipt.transactionHash,
        invoiceId,
        ipfsHash,
      };
    } catch (error) {
      console.error('Error creating invoice on blockchain:', error);
      throw error;
    }
  }
  
  /**
   * Pay an invoice on the blockchain
   * @param walletId Wallet ID for signing the transaction
   * @param invoiceId Invoice ID
   * @param amountInWei Amount to pay in wei
   * @param network Blockchain network
   * @returns Transaction receipt
   */
  async payInvoice(
    walletId: string,
    invoiceId: number,
    amountInWei: string,
    network: BlockchainNetwork
  ): Promise<{
    transactionHash: string;
  }> {
    try {
      // Get contract instance
      const contract = await this.getContract(network, walletId);
      
      // Estimate gas
      const gasEstimate = await contract.estimateGas.payInvoice(invoiceId, {
        value: amountInWei,
      });
      
      // Apply gas multiplier
      const gasLimit = Math.floor(
        Number(gasEstimate.toString()) * GAS_PRICE_CONFIG.gasMultiplier
      );
      
      // Pay invoice
      const tx = await contract.payInvoice(invoiceId, {
        value: amountInWei,
        gasLimit,
      });
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.transactionHash,
      };
    } catch (error) {
      console.error('Error paying invoice on blockchain:', error);
      throw error;
    }
  }
  
  /**
   * Cancel an invoice on the blockchain
   * @param walletId Wallet ID for signing the transaction
   * @param invoiceId Invoice ID
   * @param network Blockchain network
   * @returns Transaction receipt
   */
  async cancelInvoice(
    walletId: string,
    invoiceId: number,
    network: BlockchainNetwork
  ): Promise<{
    transactionHash: string;
  }> {
    try {
      // Get contract instance
      const contract = await this.getContract(network, walletId);
      
      // Estimate gas
      const gasEstimate = await contract.estimateGas.cancelInvoice(invoiceId);
      
      // Apply gas multiplier
      const gasLimit = Math.floor(
        Number(gasEstimate.toString()) * GAS_PRICE_CONFIG.gasMultiplier
      );
      
      // Cancel invoice
      const tx = await contract.cancelInvoice(invoiceId, {
        gasLimit,
      });
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.transactionHash,
      };
    } catch (error) {
      console.error('Error cancelling invoice on blockchain:', error);
      throw error;
    }
  }
  
  /**
   * Update an invoice on the blockchain
   * @param walletId Wallet ID for signing the transaction
   * @param invoiceId Invoice ID
   * @param amountInWei New amount in wei
   * @param dueDate New due date
   * @param invoiceData New invoice data to store on IPFS
   * @param network Blockchain network
   * @returns Transaction receipt
   */
  async updateInvoice(
    walletId: string,
    invoiceId: number,
    amountInWei: string,
    dueDate: Date,
    invoiceData: any,
    network: BlockchainNetwork
  ): Promise<{
    transactionHash: string;
    ipfsHash: string;
  }> {
    try {
      // Upload invoice data to IPFS
      const ipfsHash = await this.ipfsService.uploadJson(invoiceData);
      
      // Get contract instance
      const contract = await this.getContract(network, walletId);
      
      // Convert due date to timestamp
      const dueDateTimestamp = Math.floor(dueDate.getTime() / 1000);
      
      // Estimate gas
      const gasEstimate = await contract.estimateGas.updateInvoice(
        invoiceId,
        amountInWei,
        dueDateTimestamp,
        ipfsHash
      );
      
      // Apply gas multiplier
      const gasLimit = Math.floor(
        Number(gasEstimate.toString()) * GAS_PRICE_CONFIG.gasMultiplier
      );
      
      // Update invoice
      const tx = await contract.updateInvoice(
        invoiceId,
        amountInWei,
        dueDateTimestamp,
        ipfsHash,
        {
          gasLimit,
        }
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.transactionHash,
        ipfsHash,
      };
    } catch (error) {
      console.error('Error updating invoice on blockchain:', error);
      throw error;
    }
  }
  
  /**
   * Get invoice details from the blockchain
   * @param invoiceId Invoice ID
   * @param network Blockchain network
   * @returns Invoice data
   */
  async getInvoice(
    invoiceId: number,
    network: BlockchainNetwork
  ): Promise<InvoiceData> {
    try {
      // Get contract instance
      const contract = await this.getContract(network);
      
      // Get invoice from contract
      const [issuer, recipient, amount, dueDate, status, ipfsHash] = await contract.getInvoice(invoiceId);
      
      // Get invoice metadata from IPFS
      let metadata = null;
      
      try {
        metadata = await this.ipfsService.getJson(ipfsHash);
      } catch (error) {
        console.warn(`Failed to get invoice metadata from IPFS: ${error}`);
      }
      
      // Create invoice data
      const invoiceData: InvoiceData = {
        id: invoiceId,
        issuer,
        recipient,
        amount: amount.toString(),
        dueDate: new Date(dueDate.toNumber() * 1000),
        status: status as InvoiceStatus,
        ipfsHash,
        metadata,
      };
      
      return invoiceData;
    } catch (error) {
      console.error('Error getting invoice from blockchain:', error);
      throw error;
    }
  }
  
  /**
   * Get all invoices issued by an address
   * @param issuerAddress Issuer address
   * @param network Blockchain network
   * @returns List of invoice IDs
   */
  async getInvoicesByIssuer(
    issuerAddress: string,
    network: BlockchainNetwork
  ): Promise<number[]> {
    try {
      // Get contract instance
      const contract = await this.getContract(network);
      
      // Get invoice IDs
      const invoiceIds = await contract.getInvoicesByIssuer(issuerAddress);
      
      // Convert BigNumber to number
      return invoiceIds.map((id: ethers.BigNumber) => id.toNumber());
    } catch (error) {
      console.error('Error getting invoices by issuer from blockchain:', error);
      throw error;
    }
  }
  
  /**
   * Get all invoices received by an address
   * @param recipientAddress Recipient address
   * @param network Blockchain network
   * @returns List of invoice IDs
   */
  async getInvoicesByRecipient(
    recipientAddress: string,
    network: BlockchainNetwork
  ): Promise<number[]> {
    try {
      // Get contract instance
      const contract = await this.getContract(network);
      
      // Get invoice IDs
      const invoiceIds = await contract.getInvoicesByRecipient(recipientAddress);
      
      // Convert BigNumber to number
      return invoiceIds.map((id: ethers.BigNumber) => id.toNumber());
    } catch (error) {
      console.error('Error getting invoices by recipient from blockchain:', error);
      throw error;
    }
  }
  
  /**
   * Get total number of invoices in the contract
   * @param network Blockchain network
   * @returns Invoice count
   */
  async getInvoiceCount(network: BlockchainNetwork): Promise<number> {
    try {
      // Get contract instance
      const contract = await this.getContract(network);
      
      // Get invoice count
      const count = await contract.getInvoiceCount();
      
      return count.toNumber();
    } catch (error) {
      console.error('Error getting invoice count from blockchain:', error);
      throw error;
    }
  }
  
  /**
   * Get multiple invoices by IDs
   * @param invoiceIds List of invoice IDs
   * @param network Blockchain network
   * @returns List of invoice data
   */
  async getInvoicesByIds(
    invoiceIds: number[],
    network: BlockchainNetwork
  ): Promise<InvoiceData[]> {
    try {
      const invoices: InvoiceData[] = [];
      
      // Get each invoice
      for (const id of invoiceIds) {
        try {
          const invoice = await this.getInvoice(id, network);
          invoices.push(invoice);
        } catch (error) {
          console.warn(`Failed to get invoice ${id}: ${error}`);
        }
      }
      
      return invoices;
    } catch (error) {
      console.error('Error getting invoices by IDs from blockchain:', error);
      throw error;
    }
  }
  
  /**
   * Get transaction explorer URL
   * @param transactionHash Transaction hash
   * @param network Blockchain network
   * @returns Transaction explorer URL
   */
  getTransactionExplorerUrl(
    transactionHash: string,
    network: BlockchainNetwork
  ): string {
    return this.provider.getTransactionExplorerUrl(network, transactionHash);
  }
  
  /**
   * Get address explorer URL
   * @param address Address
   * @param network Blockchain network
   * @returns Address explorer URL
   */
  getAddressExplorerUrl(
    address: string,
    network: BlockchainNetwork
  ): string {
    return this.provider.getAddressExplorerUrl(network, address);
  }
}
