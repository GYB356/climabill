/**
 * Blockchain configuration
 */

// Network configuration
export enum BlockchainNetwork {
  ETHEREUM_MAINNET = 'ethereum_mainnet',
  ETHEREUM_GOERLI = 'ethereum_goerli',
  POLYGON_MAINNET = 'polygon_mainnet',
  POLYGON_MUMBAI = 'polygon_mumbai',
  POLKADOT = 'polkadot',
  KUSAMA = 'kusama',
}

// Network configuration details
export const NETWORK_CONFIG = {
  [BlockchainNetwork.ETHEREUM_MAINNET]: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.ETHEREUM_MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/',
    blockExplorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [BlockchainNetwork.ETHEREUM_GOERLI]: {
    chainId: 5,
    name: 'Goerli Testnet',
    rpcUrl: process.env.ETHEREUM_GOERLI_RPC_URL || 'https://goerli.infura.io/v3/',
    blockExplorerUrl: 'https://goerli.etherscan.io',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [BlockchainNetwork.POLYGON_MAINNET]: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: process.env.POLYGON_MAINNET_RPC_URL || 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  [BlockchainNetwork.POLYGON_MUMBAI]: {
    chainId: 80001,
    name: 'Mumbai Testnet',
    rpcUrl: process.env.POLYGON_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  [BlockchainNetwork.POLKADOT]: {
    name: 'Polkadot',
    rpcUrl: process.env.POLKADOT_RPC_URL || 'wss://rpc.polkadot.io',
    blockExplorerUrl: 'https://polkadot.subscan.io',
    nativeCurrency: {
      name: 'DOT',
      symbol: 'DOT',
      decimals: 10,
    },
  },
  [BlockchainNetwork.KUSAMA]: {
    name: 'Kusama',
    rpcUrl: process.env.KUSAMA_RPC_URL || 'wss://kusama-rpc.polkadot.io',
    blockExplorerUrl: 'https://kusama.subscan.io',
    nativeCurrency: {
      name: 'KSM',
      symbol: 'KSM',
      decimals: 12,
    },
  },
};

// Default network to use
export const DEFAULT_NETWORK = process.env.NODE_ENV === 'production'
  ? BlockchainNetwork.ETHEREUM_MAINNET
  : BlockchainNetwork.ETHEREUM_GOERLI;

// Provider configuration
export const PROVIDER_CONFIG = {
  infuraProjectId: process.env.INFURA_PROJECT_ID || '',
  alchemyApiKey: process.env.ALCHEMY_API_KEY || '',
  useAlchemy: process.env.USE_ALCHEMY === 'true',
};

// Smart contract addresses
export const CONTRACT_ADDRESSES = {
  [BlockchainNetwork.ETHEREUM_MAINNET]: {
    invoiceContract: process.env.MAINNET_INVOICE_CONTRACT_ADDRESS || '',
    tokenContract: process.env.MAINNET_TOKEN_CONTRACT_ADDRESS || '',
    storageContract: process.env.MAINNET_STORAGE_CONTRACT_ADDRESS || '',
  },
  [BlockchainNetwork.ETHEREUM_GOERLI]: {
    invoiceContract: process.env.GOERLI_INVOICE_CONTRACT_ADDRESS || '',
    tokenContract: process.env.GOERLI_TOKEN_CONTRACT_ADDRESS || '',
    storageContract: process.env.GOERLI_STORAGE_CONTRACT_ADDRESS || '',
  },
  [BlockchainNetwork.POLYGON_MAINNET]: {
    invoiceContract: process.env.POLYGON_INVOICE_CONTRACT_ADDRESS || '',
    tokenContract: process.env.POLYGON_TOKEN_CONTRACT_ADDRESS || '',
    storageContract: process.env.POLYGON_STORAGE_CONTRACT_ADDRESS || '',
  },
  [BlockchainNetwork.POLYGON_MUMBAI]: {
    invoiceContract: process.env.MUMBAI_INVOICE_CONTRACT_ADDRESS || '',
    tokenContract: process.env.MUMBAI_TOKEN_CONTRACT_ADDRESS || '',
    storageContract: process.env.MUMBAI_STORAGE_CONTRACT_ADDRESS || '',
  },
};

// Gas price configuration
export const GAS_PRICE_CONFIG = {
  defaultGasLimit: 300000,
  gasMultiplier: 1.2, // Multiply estimated gas by this factor
  maxFeePerGas: null, // Set to null to use network estimation
  maxPriorityFeePerGas: null, // Set to null to use network estimation
};

// IPFS configuration
export const IPFS_CONFIG = {
  gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
  pinningService: process.env.IPFS_PINNING_SERVICE || 'pinata', // 'pinata', 'infura', 'web3.storage'
  pinataApiKey: process.env.PINATA_API_KEY || '',
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY || '',
  infuraProjectId: process.env.INFURA_IPFS_PROJECT_ID || '',
  infuraProjectSecret: process.env.INFURA_IPFS_PROJECT_SECRET || '',
  web3StorageApiToken: process.env.WEB3_STORAGE_API_TOKEN || '',
};

// Wallet configuration
export const WALLET_CONFIG = {
  defaultDerivationPath: "m/44'/60'/0'/0/0", // Ethereum
  encryptionLevel: 'high', // 'standard', 'high'
  autoLockTimeout: 15 * 60 * 1000, // 15 minutes in milliseconds
  maxUnlockAttempts: 5,
};

// Transaction configuration
export const TRANSACTION_CONFIG = {
  confirmationBlocks: 2, // Number of blocks to wait for confirmation
  timeout: 60 * 1000, // 60 seconds in milliseconds
  retryAttempts: 3,
  retryDelay: 2000, // 2 seconds in milliseconds
};
