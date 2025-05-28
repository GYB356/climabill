import axios from 'axios';
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { IPFS_CONFIG } from './config';

/**
 * Service for interacting with IPFS
 */
export class IpfsService {
  private client: IPFSHTTPClient | null = null;
  
  constructor() {
    this.initializeClient();
  }
  
  /**
   * Initialize IPFS client based on configuration
   */
  private initializeClient(): void {
    try {
      // Use Infura IPFS if configured
      if (IPFS_CONFIG.pinningService === 'infura' && 
          IPFS_CONFIG.infuraProjectId && 
          IPFS_CONFIG.infuraProjectSecret) {
        
        const auth = 'Basic ' + Buffer.from(
          IPFS_CONFIG.infuraProjectId + ':' + IPFS_CONFIG.infuraProjectSecret
        ).toString('base64');
        
        this.client = create({
          host: 'ipfs.infura.io',
          port: 5001,
          protocol: 'https',
          headers: {
            authorization: auth,
          },
        });
      } 
      // Otherwise, don't initialize client - we'll use API calls for Pinata or Web3.Storage
      else {
        this.client = null;
      }
    } catch (error) {
      console.error('Failed to initialize IPFS client:', error);
      this.client = null;
    }
  }
  
  /**
   * Upload a file to IPFS
   * @param content File content
   * @param options Upload options
   * @returns IPFS hash (CID)
   */
  async uploadFile(
    content: Buffer,
    options?: {
      name?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<string> {
    try {
      // Use Infura IPFS client if available
      if (this.client) {
        const result = await this.client.add(content);
        return result.cid.toString();
      }
      
      // Use Pinata if configured
      if (IPFS_CONFIG.pinningService === 'pinata' && 
          IPFS_CONFIG.pinataApiKey && 
          IPFS_CONFIG.pinataSecretApiKey) {
        
        const formData = new FormData();
        formData.append('file', new Blob([content]));
        
        if (options?.name || options?.metadata) {
          const pinataMetadata = {
            name: options?.name || 'file',
            keyvalues: options?.metadata || {},
          };
          
          formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
        }
        
        const response = await axios.post(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'pinata_api_key': IPFS_CONFIG.pinataApiKey,
              'pinata_secret_api_key': IPFS_CONFIG.pinataSecretApiKey,
            },
          }
        );
        
        return response.data.IpfsHash;
      }
      
      // Use Web3.Storage if configured
      if (IPFS_CONFIG.pinningService === 'web3.storage' && 
          IPFS_CONFIG.web3StorageApiToken) {
        
        const response = await axios.post(
          'https://api.web3.storage/upload',
          content,
          {
            headers: {
              'Authorization': `Bearer ${IPFS_CONFIG.web3StorageApiToken}`,
              'Content-Type': 'application/octet-stream',
              'X-NAME': options?.name || 'file',
            },
          }
        );
        
        return response.data.cid;
      }
      
      throw new Error('No IPFS pinning service configured');
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw error;
    }
  }
  
  /**
   * Upload JSON data to IPFS
   * @param data JSON data
   * @param options Upload options
   * @returns IPFS hash (CID)
   */
  async uploadJson(
    data: any,
    options?: {
      name?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<string> {
    try {
      const jsonString = JSON.stringify(data);
      const content = Buffer.from(jsonString);
      
      return this.uploadFile(content, {
        name: options?.name || 'data.json',
        metadata: {
          ...options?.metadata,
          contentType: 'application/json',
        },
      });
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw error;
    }
  }
  
  /**
   * Get file content from IPFS
   * @param cid IPFS hash (CID)
   * @returns File content as Buffer
   */
  async getFile(cid: string): Promise<Buffer> {
    try {
      // Use Infura IPFS client if available
      if (this.client) {
        const chunks = [];
        
        for await (const chunk of this.client.cat(cid)) {
          chunks.push(chunk);
        }
        
        return Buffer.concat(chunks);
      }
      
      // Use IPFS gateway
      const response = await axios.get(`${IPFS_CONFIG.gateway}${cid}`, {
        responseType: 'arraybuffer',
      });
      
      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error getting file from IPFS:', error);
      throw error;
    }
  }
  
  /**
   * Get JSON data from IPFS
   * @param cid IPFS hash (CID)
   * @returns Parsed JSON data
   */
  async getJson(cid: string): Promise<any> {
    try {
      const content = await this.getFile(cid);
      return JSON.parse(content.toString());
    } catch (error) {
      console.error('Error getting JSON from IPFS:', error);
      throw error;
    }
  }
  
  /**
   * Pin an existing IPFS hash
   * @param cid IPFS hash (CID)
   * @param options Pin options
   * @returns Success status
   */
  async pinHash(
    cid: string,
    options?: {
      name?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<boolean> {
    try {
      // Use Infura IPFS client if available
      if (this.client) {
        await this.client.pin.add(cid);
        return true;
      }
      
      // Use Pinata if configured
      if (IPFS_CONFIG.pinningService === 'pinata' && 
          IPFS_CONFIG.pinataApiKey && 
          IPFS_CONFIG.pinataSecretApiKey) {
        
        const pinataMetadata = options ? {
          name: options.name,
          keyvalues: options.metadata,
        } : undefined;
        
        await axios.post(
          'https://api.pinata.cloud/pinning/pinByHash',
          {
            hashToPin: cid,
            pinataMetadata,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'pinata_api_key': IPFS_CONFIG.pinataApiKey,
              'pinata_secret_api_key': IPFS_CONFIG.pinataSecretApiKey,
            },
          }
        );
        
        return true;
      }
      
      // Use Web3.Storage if configured
      if (IPFS_CONFIG.pinningService === 'web3.storage' && 
          IPFS_CONFIG.web3StorageApiToken) {
        
        // Web3.Storage doesn't have a direct "pin by hash" API
        // We need to download the content and re-upload it
        const content = await this.getFile(cid);
        
        await axios.post(
          'https://api.web3.storage/upload',
          content,
          {
            headers: {
              'Authorization': `Bearer ${IPFS_CONFIG.web3StorageApiToken}`,
              'Content-Type': 'application/octet-stream',
              'X-NAME': options?.name || cid,
            },
          }
        );
        
        return true;
      }
      
      throw new Error('No IPFS pinning service configured');
    } catch (error) {
      console.error('Error pinning hash to IPFS:', error);
      throw error;
    }
  }
  
  /**
   * Unpin an IPFS hash
   * @param cid IPFS hash (CID)
   * @returns Success status
   */
  async unpinHash(cid: string): Promise<boolean> {
    try {
      // Use Infura IPFS client if available
      if (this.client) {
        await this.client.pin.rm(cid);
        return true;
      }
      
      // Use Pinata if configured
      if (IPFS_CONFIG.pinningService === 'pinata' && 
          IPFS_CONFIG.pinataApiKey && 
          IPFS_CONFIG.pinataSecretApiKey) {
        
        await axios.delete(
          `https://api.pinata.cloud/pinning/unpin/${cid}`,
          {
            headers: {
              'pinata_api_key': IPFS_CONFIG.pinataApiKey,
              'pinata_secret_api_key': IPFS_CONFIG.pinataSecretApiKey,
            },
          }
        );
        
        return true;
      }
      
      // Web3.Storage doesn't support unpinning
      if (IPFS_CONFIG.pinningService === 'web3.storage') {
        console.warn('Web3.Storage does not support unpinning');
        return false;
      }
      
      throw new Error('No IPFS pinning service configured');
    } catch (error) {
      console.error('Error unpinning hash from IPFS:', error);
      throw error;
    }
  }
  
  /**
   * Get IPFS gateway URL for a hash
   * @param cid IPFS hash (CID)
   * @returns Gateway URL
   */
  getGatewayUrl(cid: string): string {
    return `${IPFS_CONFIG.gateway}${cid}`;
  }
}
