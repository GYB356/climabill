import { ethers } from 'ethers';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { BlockchainNetwork, NETWORK_CONFIG, PROVIDER_CONFIG } from './config';

/**
 * Class for managing blockchain providers
 */
export class BlockchainProvider {
  private static instance: BlockchainProvider;
  private ethereumProviders: Map<BlockchainNetwork, ethers.providers.Provider>;
  private polkadotProviders: Map<BlockchainNetwork, ApiPromise>;
  private isInitialized: boolean;

  private constructor() {
    this.ethereumProviders = new Map();
    this.polkadotProviders = new Map();
    this.isInitialized = false;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): BlockchainProvider {
    if (!BlockchainProvider.instance) {
      BlockchainProvider.instance = new BlockchainProvider();
    }
    return BlockchainProvider.instance;
  }

  /**
   * Initialize providers
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize Ethereum providers
      await this.initializeEthereumProviders();

      // Initialize Polkadot providers
      await this.initializePolkadotProviders();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize blockchain providers:', error);
      throw error;
    }
  }

  /**
   * Initialize Ethereum providers
   */
  private async initializeEthereumProviders(): Promise<void> {
    const ethereumNetworks = [
      BlockchainNetwork.ETHEREUM_MAINNET,
      BlockchainNetwork.ETHEREUM_GOERLI,
      BlockchainNetwork.POLYGON_MAINNET,
      BlockchainNetwork.POLYGON_MUMBAI,
    ];

    for (const network of ethereumNetworks) {
      const networkConfig = NETWORK_CONFIG[network];
      
      if (!networkConfig) {
        console.warn(`Network configuration not found for ${network}`);
        continue;
      }

      let provider: ethers.providers.Provider;

      // Use Alchemy if configured
      if (PROVIDER_CONFIG.useAlchemy && PROVIDER_CONFIG.alchemyApiKey) {
        const alchemyUrl = this.getAlchemyUrl(network);
        provider = new ethers.providers.JsonRpcProvider(alchemyUrl);
      } 
      // Use Infura if configured
      else if (PROVIDER_CONFIG.infuraProjectId) {
        const infuraUrl = this.getInfuraUrl(network);
        provider = new ethers.providers.JsonRpcProvider(infuraUrl);
      } 
      // Use default RPC URL
      else {
        provider = new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);
      }

      this.ethereumProviders.set(network, provider);
    }
  }

  /**
   * Initialize Polkadot providers
   */
  private async initializePolkadotProviders(): Promise<void> {
    const polkadotNetworks = [
      BlockchainNetwork.POLKADOT,
      BlockchainNetwork.KUSAMA,
    ];

    for (const network of polkadotNetworks) {
      const networkConfig = NETWORK_CONFIG[network];
      
      if (!networkConfig) {
        console.warn(`Network configuration not found for ${network}`);
        continue;
      }

      const wsProvider = new WsProvider(networkConfig.rpcUrl);
      const api = await ApiPromise.create({ provider: wsProvider });
      
      this.polkadotProviders.set(network, api);
    }
  }

  /**
   * Get Ethereum provider for a specific network
   * @param network Blockchain network
   * @returns Ethereum provider
   */
  public getEthereumProvider(network: BlockchainNetwork): ethers.providers.Provider {
    if (!this.isInitialized) {
      throw new Error('BlockchainProvider is not initialized. Call initialize() first.');
    }

    const provider = this.ethereumProviders.get(network);
    
    if (!provider) {
      throw new Error(`Provider not found for network: ${network}`);
    }
    
    return provider;
  }

  /**
   * Get Polkadot provider for a specific network
   * @param network Blockchain network
   * @returns Polkadot provider
   */
  public getPolkadotProvider(network: BlockchainNetwork): ApiPromise {
    if (!this.isInitialized) {
      throw new Error('BlockchainProvider is not initialized. Call initialize() first.');
    }

    const provider = this.polkadotProviders.get(network);
    
    if (!provider) {
      throw new Error(`Provider not found for network: ${network}`);
    }
    
    return provider;
  }

  /**
   * Check if a network is a Polkadot-based network
   * @param network Blockchain network
   * @returns True if the network is Polkadot-based
   */
  public isPolkadotNetwork(network: BlockchainNetwork): boolean {
    return network === BlockchainNetwork.POLKADOT || network === BlockchainNetwork.KUSAMA;
  }

  /**
   * Get Infura URL for a specific network
   * @param network Blockchain network
   * @returns Infura URL
   */
  private getInfuraUrl(network: BlockchainNetwork): string {
    const projectId = PROVIDER_CONFIG.infuraProjectId;
    
    switch (network) {
      case BlockchainNetwork.ETHEREUM_MAINNET:
        return `https://mainnet.infura.io/v3/${projectId}`;
      case BlockchainNetwork.ETHEREUM_GOERLI:
        return `https://goerli.infura.io/v3/${projectId}`;
      case BlockchainNetwork.POLYGON_MAINNET:
        return `https://polygon-mainnet.infura.io/v3/${projectId}`;
      case BlockchainNetwork.POLYGON_MUMBAI:
        return `https://polygon-mumbai.infura.io/v3/${projectId}`;
      default:
        throw new Error(`Infura URL not available for network: ${network}`);
    }
  }

  /**
   * Get Alchemy URL for a specific network
   * @param network Blockchain network
   * @returns Alchemy URL
   */
  private getAlchemyUrl(network: BlockchainNetwork): string {
    const apiKey = PROVIDER_CONFIG.alchemyApiKey;
    
    switch (network) {
      case BlockchainNetwork.ETHEREUM_MAINNET:
        return `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;
      case BlockchainNetwork.ETHEREUM_GOERLI:
        return `https://eth-goerli.alchemyapi.io/v2/${apiKey}`;
      case BlockchainNetwork.POLYGON_MAINNET:
        return `https://polygon-mainnet.alchemyapi.io/v2/${apiKey}`;
      case BlockchainNetwork.POLYGON_MUMBAI:
        return `https://polygon-mumbai.alchemyapi.io/v2/${apiKey}`;
      default:
        throw new Error(`Alchemy URL not available for network: ${network}`);
    }
  }

  /**
   * Get block explorer URL for a transaction
   * @param network Blockchain network
   * @param txHash Transaction hash
   * @returns Block explorer URL
   */
  public getTransactionExplorerUrl(network: BlockchainNetwork, txHash: string): string {
    const networkConfig = NETWORK_CONFIG[network];
    
    if (!networkConfig) {
      throw new Error(`Network configuration not found for ${network}`);
    }
    
    return `${networkConfig.blockExplorerUrl}/tx/${txHash}`;
  }

  /**
   * Get block explorer URL for an address
   * @param network Blockchain network
   * @param address Address
   * @returns Block explorer URL
   */
  public getAddressExplorerUrl(network: BlockchainNetwork, address: string): string {
    const networkConfig = NETWORK_CONFIG[network];
    
    if (!networkConfig) {
      throw new Error(`Network configuration not found for ${network}`);
    }
    
    return `${networkConfig.blockExplorerUrl}/address/${address}`;
  }

  /**
   * Get current gas price for an Ethereum network
   * @param network Ethereum network
   * @returns Gas price in wei
   */
  public async getGasPrice(network: BlockchainNetwork): Promise<ethers.BigNumber> {
    const provider = this.getEthereumProvider(network);
    return provider.getGasPrice();
  }

  /**
   * Get current block number
   * @param network Blockchain network
   * @returns Current block number
   */
  public async getBlockNumber(network: BlockchainNetwork): Promise<number> {
    if (this.isPolkadotNetwork(network)) {
      const provider = this.getPolkadotProvider(network);
      const header = await provider.rpc.chain.getHeader();
      return header.number.toNumber();
    } else {
      const provider = this.getEthereumProvider(network);
      return provider.getBlockNumber();
    }
  }

  /**
   * Get network chain ID
   * @param network Ethereum network
   * @returns Chain ID
   */
  public async getChainId(network: BlockchainNetwork): Promise<number> {
    if (this.isPolkadotNetwork(network)) {
      throw new Error('Chain ID is not applicable for Polkadot networks');
    }
    
    const provider = this.getEthereumProvider(network) as ethers.providers.JsonRpcProvider;
    return (await provider.getNetwork()).chainId;
  }
}
