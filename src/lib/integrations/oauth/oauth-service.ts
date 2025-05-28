import { firestore } from '../../firebase/config';
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
import { OAuthProvider, IntegrationStatus, IntegrationData, OAUTH_CONFIG, OAuthTokenResponse, OAuthStateData } from './config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { encrypt, decrypt } from '../../utils/encryption';

/**
 * Service for handling OAuth authentication and token management
 */
export class OAuthService {
  private readonly INTEGRATION_COLLECTION = 'integrations';
  private readonly STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
  private readonly STATE_COLLECTION = 'oauthStates';
  
  /**
   * Generate an OAuth authorization URL
   * @param provider OAuth provider
   * @param userId User ID
   * @param organizationId Optional organization ID
   * @param redirectPath Optional redirect path after successful authentication
   * @returns Authorization URL and state
   */
  async generateAuthUrl(
    provider: OAuthProvider,
    userId: string,
    organizationId?: string,
    redirectPath?: string
  ): Promise<{ authUrl: string; state: string }> {
    try {
      const config = OAUTH_CONFIG[provider];
      
      if (!config) {
        throw new Error(`OAuth configuration not found for provider: ${provider}`);
      }
      
      // Generate state for CSRF protection
      const state = uuidv4();
      
      // Store state data
      const stateData: OAuthStateData = {
        userId,
        organizationId,
        provider,
        redirectPath,
      };
      
      // Save state to Firestore with expiry
      await addDoc(collection(firestore, this.STATE_COLLECTION), {
        state,
        data: stateData,
        expiresAt: Timestamp.fromMillis(Date.now() + this.STATE_EXPIRY_MS),
        createdAt: Timestamp.now(),
      });
      
      // Build authorization URL
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code',
        scope: config.scope,
        state,
      });
      
      const authUrl = `${config.authUrl}?${params.toString()}`;
      
      return { authUrl, state };
    } catch (error) {
      console.error('Error generating OAuth authorization URL:', error);
      throw error;
    }
  }
  
  /**
   * Validate OAuth state and get state data
   * @param state OAuth state
   * @returns State data or null if invalid
   */
  async validateState(state: string): Promise<OAuthStateData | null> {
    try {
      // Query state from Firestore
      const q = query(
        collection(firestore, this.STATE_COLLECTION),
        where('state', '==', state),
        where('expiresAt', '>', Timestamp.now())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const stateDoc = querySnapshot.docs[0];
      const stateData = stateDoc.data().data as OAuthStateData;
      
      // Delete state document to prevent reuse
      await deleteDoc(stateDoc.ref);
      
      return stateData;
    } catch (error) {
      console.error('Error validating OAuth state:', error);
      return null;
    }
  }
  
  /**
   * Exchange authorization code for access token
   * @param provider OAuth provider
   * @param code Authorization code
   * @returns Token response
   */
  async exchangeCodeForToken(
    provider: OAuthProvider,
    code: string
  ): Promise<OAuthTokenResponse> {
    try {
      const config = OAUTH_CONFIG[provider];
      
      if (!config) {
        throw new Error(`OAuth configuration not found for provider: ${provider}`);
      }
      
      // Build request data
      const data = {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        code,
        grant_type: 'authorization_code',
      };
      
      // Make token request
      const response = await axios.post(config.tokenUrl, new URLSearchParams(data), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }
  
  /**
   * Save integration data to Firestore
   * @param userId User ID
   * @param provider OAuth provider
   * @param tokenResponse Token response
   * @param organizationId Optional organization ID
   * @param providerAccountId Optional provider account ID
   * @param providerTenantId Optional provider tenant ID
   * @returns Integration data
   */
  async saveIntegration(
    userId: string,
    provider: OAuthProvider,
    tokenResponse: OAuthTokenResponse,
    organizationId?: string,
    providerAccountId?: string,
    providerTenantId?: string
  ): Promise<IntegrationData> {
    try {
      // Check if integration already exists
      const existingIntegration = await this.getIntegration(userId, provider, organizationId);
      
      const now = new Date();
      let tokenExpiry: Date | undefined;
      
      if (tokenResponse.expires_in) {
        tokenExpiry = new Date(now.getTime() + tokenResponse.expires_in * 1000);
      }
      
      // Encrypt tokens for security
      const encryptedAccessToken = encrypt(tokenResponse.access_token);
      const encryptedRefreshToken = tokenResponse.refresh_token 
        ? encrypt(tokenResponse.refresh_token) 
        : undefined;
      
      if (existingIntegration) {
        // Update existing integration
        const integrationRef = doc(firestore, this.INTEGRATION_COLLECTION, existingIntegration.id as string);
        
        const updateData = {
          status: IntegrationStatus.CONNECTED,
          accessToken: encryptedAccessToken,
          updatedAt: now,
        } as Partial<IntegrationData>;
        
        if (encryptedRefreshToken) {
          updateData.refreshToken = encryptedRefreshToken;
        }
        
        if (tokenExpiry) {
          updateData.tokenExpiry = tokenExpiry;
        }
        
        if (tokenResponse.scope) {
          updateData.scope = tokenResponse.scope;
        }
        
        if (providerAccountId) {
          updateData.providerAccountId = providerAccountId;
        }
        
        if (providerTenantId) {
          updateData.providerTenantId = providerTenantId;
        }
        
        await updateDoc(integrationRef, updateData);
        
        return {
          ...existingIntegration,
          ...updateData,
        };
      } else {
        // Create new integration
        const integrationData: Omit<IntegrationData, 'id'> = {
          userId,
          organizationId,
          provider,
          status: IntegrationStatus.CONNECTED,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          tokenExpiry,
          scope: tokenResponse.scope,
          providerAccountId,
          providerTenantId,
          createdAt: now,
          updatedAt: now,
        };
        
        const docRef = await addDoc(collection(firestore, this.INTEGRATION_COLLECTION), integrationData);
        
        return {
          ...integrationData,
          id: docRef.id,
        };
      }
    } catch (error) {
      console.error('Error saving integration:', error);
      throw error;
    }
  }
  
  /**
   * Get integration data
   * @param userId User ID
   * @param provider OAuth provider
   * @param organizationId Optional organization ID
   * @returns Integration data or null if not found
   */
  async getIntegration(
    userId: string,
    provider: OAuthProvider,
    organizationId?: string
  ): Promise<IntegrationData | null> {
    try {
      // Create query
      let q = query(
        collection(firestore, this.INTEGRATION_COLLECTION),
        where('userId', '==', userId),
        where('provider', '==', provider)
      );
      
      if (organizationId) {
        q = query(
          collection(firestore, this.INTEGRATION_COLLECTION),
          where('userId', '==', userId),
          where('provider', '==', provider),
          where('organizationId', '==', organizationId)
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data() as IntegrationData;
      
      // Check if token is expired
      if (data.tokenExpiry && new Date(data.tokenExpiry) < new Date()) {
        if (data.refreshToken) {
          // Try to refresh token
          try {
            const refreshedData = await this.refreshToken(doc.id);
            return refreshedData;
          } catch (error) {
            // Update status to expired
            await updateDoc(doc.ref, {
              status: IntegrationStatus.EXPIRED,
              updatedAt: new Date(),
            });
            
            data.status = IntegrationStatus.EXPIRED;
          }
        } else {
          // Update status to expired
          await updateDoc(doc.ref, {
            status: IntegrationStatus.EXPIRED,
            updatedAt: new Date(),
          });
          
          data.status = IntegrationStatus.EXPIRED;
        }
      }
      
      return {
        ...data,
        id: doc.id,
      };
    } catch (error) {
      console.error('Error getting integration:', error);
      throw error;
    }
  }
  
  /**
   * Get all integrations for a user
   * @param userId User ID
   * @param organizationId Optional organization ID
   * @returns List of integration data
   */
  async getUserIntegrations(
    userId: string,
    organizationId?: string
  ): Promise<IntegrationData[]> {
    try {
      // Create query
      let q = query(
        collection(firestore, this.INTEGRATION_COLLECTION),
        where('userId', '==', userId)
      );
      
      if (organizationId) {
        q = query(
          collection(firestore, this.INTEGRATION_COLLECTION),
          where('userId', '==', userId),
          where('organizationId', '==', organizationId)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const integrations: IntegrationData[] = [];
      
      for (const doc of querySnapshot.docs) {
        const data = doc.data() as IntegrationData;
        
        // Check if token is expired
        if (data.tokenExpiry && new Date(data.tokenExpiry) < new Date()) {
          if (data.refreshToken) {
            // Try to refresh token
            try {
              const refreshedData = await this.refreshToken(doc.id);
              integrations.push(refreshedData);
              continue;
            } catch (error) {
              // Update status to expired
              await updateDoc(doc.ref, {
                status: IntegrationStatus.EXPIRED,
                updatedAt: new Date(),
              });
              
              data.status = IntegrationStatus.EXPIRED;
            }
          } else {
            // Update status to expired
            await updateDoc(doc.ref, {
              status: IntegrationStatus.EXPIRED,
              updatedAt: new Date(),
            });
            
            data.status = IntegrationStatus.EXPIRED;
          }
        }
        
        integrations.push({
          ...data,
          id: doc.id,
        });
      }
      
      return integrations;
    } catch (error) {
      console.error('Error getting user integrations:', error);
      throw error;
    }
  }
  
  /**
   * Refresh OAuth token
   * @param integrationId Integration ID
   * @returns Updated integration data
   */
  async refreshToken(integrationId: string): Promise<IntegrationData> {
    try {
      // Get integration data
      const integrationRef = doc(firestore, this.INTEGRATION_COLLECTION, integrationId);
      const integrationSnap = await getDoc(integrationRef);
      
      if (!integrationSnap.exists()) {
        throw new Error(`Integration with ID ${integrationId} not found`);
      }
      
      const integration = integrationSnap.data() as IntegrationData;
      
      if (!integration.refreshToken) {
        throw new Error('Refresh token not available');
      }
      
      const config = OAUTH_CONFIG[integration.provider];
      
      if (!config) {
        throw new Error(`OAuth configuration not found for provider: ${integration.provider}`);
      }
      
      // Decrypt refresh token
      const refreshToken = decrypt(integration.refreshToken);
      
      // Build request data
      const data = {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      };
      
      // Make token request
      const response = await axios.post(config.tokenUrl, new URLSearchParams(data), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      const tokenResponse = response.data as OAuthTokenResponse;
      
      // Calculate new expiry
      const now = new Date();
      let tokenExpiry: Date | undefined;
      
      if (tokenResponse.expires_in) {
        tokenExpiry = new Date(now.getTime() + tokenResponse.expires_in * 1000);
      }
      
      // Encrypt tokens
      const encryptedAccessToken = encrypt(tokenResponse.access_token);
      const encryptedRefreshToken = tokenResponse.refresh_token 
        ? encrypt(tokenResponse.refresh_token) 
        : integration.refreshToken;
      
      // Update integration
      const updateData = {
        status: IntegrationStatus.CONNECTED,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry,
        updatedAt: now,
      };
      
      await updateDoc(integrationRef, updateData);
      
      return {
        ...integration,
        ...updateData,
        id: integrationId,
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }
  
  /**
   * Delete integration
   * @param integrationId Integration ID
   */
  async deleteIntegration(integrationId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, this.INTEGRATION_COLLECTION, integrationId));
    } catch (error) {
      console.error('Error deleting integration:', error);
      throw error;
    }
  }
  
  /**
   * Get access token for an integration
   * @param userId User ID
   * @param provider OAuth provider
   * @param organizationId Optional organization ID
   * @returns Access token or null if not found
   */
  async getAccessToken(
    userId: string,
    provider: OAuthProvider,
    organizationId?: string
  ): Promise<string | null> {
    try {
      const integration = await this.getIntegration(userId, provider, organizationId);
      
      if (!integration) {
        return null;
      }
      
      if (integration.status !== IntegrationStatus.CONNECTED) {
        return null;
      }
      
      // Decrypt access token
      return decrypt(integration.accessToken);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }
  
  /**
   * Check if a user has a connected integration
   * @param userId User ID
   * @param provider OAuth provider
   * @param organizationId Optional organization ID
   * @returns True if connected
   */
  async isConnected(
    userId: string,
    provider: OAuthProvider,
    organizationId?: string
  ): Promise<boolean> {
    try {
      const integration = await this.getIntegration(userId, provider, organizationId);
      
      return integration !== null && integration.status === IntegrationStatus.CONNECTED;
    } catch (error) {
      console.error('Error checking integration connection:', error);
      return false;
    }
  }
  
  /**
   * Update integration settings
   * @param integrationId Integration ID
   * @param settings Settings object
   * @returns Updated integration data
   */
  async updateIntegrationSettings(
    integrationId: string,
    settings: Record<string, any>
  ): Promise<IntegrationData> {
    try {
      const integrationRef = doc(firestore, this.INTEGRATION_COLLECTION, integrationId);
      const integrationSnap = await getDoc(integrationRef);
      
      if (!integrationSnap.exists()) {
        throw new Error(`Integration with ID ${integrationId} not found`);
      }
      
      const integration = integrationSnap.data() as IntegrationData;
      
      // Merge settings
      const updatedSettings = {
        ...integration.settings,
        ...settings,
      };
      
      // Update integration
      await updateDoc(integrationRef, {
        settings: updatedSettings,
        updatedAt: new Date(),
      });
      
      return {
        ...integration,
        settings: updatedSettings,
        updatedAt: new Date(),
        id: integrationId,
      };
    } catch (error) {
      console.error('Error updating integration settings:', error);
      throw error;
    }
  }
}
