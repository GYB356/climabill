/**
 * OAuth configuration for third-party integrations
 */

// OAuth provider types
export enum OAuthProvider {
  QUICKBOOKS = 'quickbooks',
  XERO = 'xero',
  SLACK = 'slack',
  MICROSOFT = 'microsoft',
  GOOGLE = 'google',
}

// OAuth configuration by provider
export const OAUTH_CONFIG = {
  [OAuthProvider.QUICKBOOKS]: {
    clientId: process.env.QUICKBOOKS_CLIENT_ID || '',
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || '',
    redirectUri: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/integrations/quickbooks/callback` : 'http://localhost:3000/api/integrations/quickbooks/callback',
    scope: 'com.intuit.quickbooks.accounting',
    authUrl: 'https://appcenter.intuit.com/connect/oauth2',
    tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    apiBase: 'https://quickbooks.api.intuit.com/v3',
  },
  [OAuthProvider.XERO]: {
    clientId: process.env.XERO_CLIENT_ID || '',
    clientSecret: process.env.XERO_CLIENT_SECRET || '',
    redirectUri: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/integrations/xero/callback` : 'http://localhost:3000/api/integrations/xero/callback',
    scope: 'accounting.transactions accounting.settings accounting.contacts offline_access',
    authUrl: 'https://login.xero.com/identity/connect/authorize',
    tokenUrl: 'https://identity.xero.com/connect/token',
    apiBase: 'https://api.xero.com/api.xro/2.0',
  },
  [OAuthProvider.SLACK]: {
    clientId: process.env.SLACK_CLIENT_ID || '',
    clientSecret: process.env.SLACK_CLIENT_SECRET || '',
    redirectUri: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/integrations/slack/callback` : 'http://localhost:3000/api/integrations/slack/callback',
    scope: 'chat:write,channels:read,incoming-webhook',
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    apiBase: 'https://slack.com/api',
  },
  [OAuthProvider.MICROSOFT]: {
    clientId: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    redirectUri: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/integrations/microsoft/callback` : 'http://localhost:3000/api/integrations/microsoft/callback',
    scope: 'offline_access user.read mail.send',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    apiBase: 'https://graph.microsoft.com/v1.0',
  },
  [OAuthProvider.GOOGLE]: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/integrations/google/callback` : 'http://localhost:3000/api/integrations/google/callback',
    scope: 'https://www.googleapis.com/auth/gmail.send',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    apiBase: 'https://gmail.googleapis.com/gmail/v1',
  },
};

// Integration status
export enum IntegrationStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  EXPIRED = 'expired',
  ERROR = 'error',
}

// Integration data structure
export interface IntegrationData {
  id?: string;
  userId: string;
  organizationId?: string;
  provider: OAuthProvider;
  status: IntegrationStatus;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  scope?: string;
  providerAccountId?: string;
  providerTenantId?: string;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// OAuth token response
export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  scope?: string;
}

// OAuth state data
export interface OAuthStateData {
  userId: string;
  organizationId?: string;
  provider: OAuthProvider;
  redirectPath?: string;
}
