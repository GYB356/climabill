import { CLOVERLY_CONFIG, OffsetProjectType } from './config';

/**
 * Interface for Cloverly estimate request
 */
interface CloverlyEstimateRequest {
  weight?: {
    value: number;
    units: 'kg' | 'lb' | 'mt';
  };
  distance?: {
    value: number;
    units: 'km' | 'mi';
  };
  electricity?: {
    value: number;
    units: 'kwh';
  };
  fuel?: {
    value: number;
    units: 'gal' | 'L';
    type: 'diesel' | 'gasoline';
  };
  carbon?: {
    value: number;
    units: 'kg' | 'lb' | 'mt';
  };
  item?: {
    category: string;
    quantity: number;
  };
  organization_id?: string;
  project_type?: OffsetProjectType;
  location?: {
    country?: string;
    state?: string;
    postal_code?: string;
  };
}

/**
 * Interface for Cloverly estimate response
 */
interface CloverlyEstimateResponse {
  id: string;
  slug: string;
  state: string;
  total_cost_in_usd_cents: number;
  cost_in_usd_cents: number;
  fee_in_usd_cents: number;
  carbon_in_kg: number;
  pretty_cost: string;
  pretty_fee: string;
  pretty_carbon: string;
  offset?: {
    id: string;
    slug: string;
    name: string;
    type: string;
    registry: string;
    registry_url: string;
    vintage_year: number;
    pretty_carbon: string;
    pretty_cost: string;
    location: {
      country: string;
      state?: string;
      city?: string;
      latitude: number;
      longitude: number;
    };
  };
  environment: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for Cloverly purchase response
 */
interface CloverlyPurchaseResponse extends CloverlyEstimateResponse {
  receipt_url: string;
  renewable_certificate_url?: string;
}

/**
 * Client for interacting with the Cloverly API
 */
export class CloverlyClient {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    this.apiKey = CLOVERLY_CONFIG.apiKey;
    this.baseUrl = CLOVERLY_CONFIG.baseUrl;
    
    if (!this.apiKey) {
      console.warn('Cloverly API key is not set. Carbon offset features will not work.');
    }
  }
  
  /**
   * Make a request to the Cloverly API
   * @param endpoint API endpoint
   * @param method HTTP method
   * @param body Request body
   * @returns Response data
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      };
      
      const options: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      };
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Cloverly API error: ${errorData.message || response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error making Cloverly API request:', error);
      throw error;
    }
  }
  
  /**
   * Estimate carbon offset for a given amount of CO2e
   * @param carbonInKg Amount of CO2e in kilograms
   * @param projectType Type of offset project (optional)
   * @param location Location information (optional)
   * @returns Estimate response
   */
  async estimateOffset(
    carbonInKg: number,
    projectType?: OffsetProjectType,
    location?: {
      country?: string;
      state?: string;
      postal_code?: string;
    }
  ): Promise<CloverlyEstimateResponse> {
    const request: CloverlyEstimateRequest = {
      carbon: {
        value: carbonInKg,
        units: 'kg',
      },
    };
    
    if (projectType) {
      request.project_type = projectType;
    }
    
    if (location) {
      request.location = location;
    }
    
    return this.makeRequest<CloverlyEstimateResponse>('/estimates', 'POST', request);
  }
  
  /**
   * Purchase carbon offset based on an estimate
   * @param estimateId ID of the estimate to purchase
   * @returns Purchase response
   */
  async purchaseOffset(estimateId: string): Promise<CloverlyPurchaseResponse> {
    return this.makeRequest<CloverlyPurchaseResponse>(
      '/purchases',
      'POST',
      { estimate_slug: estimateId }
    );
  }
  
  /**
   * Get details of a specific purchase
   * @param purchaseId ID of the purchase
   * @returns Purchase details
   */
  async getPurchase(purchaseId: string): Promise<CloverlyPurchaseResponse> {
    return this.makeRequest<CloverlyPurchaseResponse>(`/purchases/${purchaseId}`);
  }
  
  /**
   * List all purchases
   * @param limit Maximum number of purchases to return
   * @param offset Offset for pagination
   * @returns List of purchases
   */
  async listPurchases(
    limit = 10,
    offset = 0
  ): Promise<{ data: CloverlyPurchaseResponse[] }> {
    return this.makeRequest<{ data: CloverlyPurchaseResponse[] }>(
      `/purchases?limit=${limit}&offset=${offset}`
    );
  }
  
  /**
   * Get available offset projects
   * @param projectType Type of offset project (optional)
   * @returns List of available projects
   */
  async getAvailableProjects(
    projectType?: OffsetProjectType
  ): Promise<{ data: any[] }> {
    let url = '/offset-projects';
    
    if (projectType) {
      url += `?type=${projectType}`;
    }
    
    return this.makeRequest<{ data: any[] }>(url);
  }
}
