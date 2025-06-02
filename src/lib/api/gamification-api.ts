import { 
  Achievement, 
  Challenge, 
  UserProfile,
  PersonalizedRecommendation,
  ScenarioModel
} from '../carbon/gamification-types';
import { CarbonUsage } from '../carbon/carbon-tracking-service';
import { API_BASE_URL } from './config';

/**
 * API client for gamification-related endpoints
 */
export class GamificationApi {
  private readonly baseUrl: string;
  
  constructor() {
    this.baseUrl = `${API_BASE_URL}/gamification`;
  }
  
  /**
   * Generic method to handle API requests
   */
  private async request<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Add authorization header if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API request failed: ${response.status} ${response.statusText} - ${
            errorData.message || 'Unknown error'
          }`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error in API request to ${url}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all available achievements
   */
  async getAllAchievements(): Promise<Achievement[]> {
    return this.request<Achievement[]>('/achievements');
  }
  
  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return this.request<Achievement[]>(`/users/${userId}/achievements`);
  }
  
  /**
   * Get user's profile with gamification data
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${userId}/profile`);
  }
  
  /**
   * Get active challenges for a user
   */
  async getActiveChallenges(userId: string): Promise<Challenge[]> {
    return this.request<Challenge[]>(`/users/${userId}/challenges`);
  }
  
  /**
   * Join a challenge
   */
  async joinChallenge(userId: string, challengeId: string): Promise<Challenge> {
    return this.request<Challenge>(
      `/users/${userId}/challenges/${challengeId}/join`,
      'POST'
    );
  }
  
  /**
   * Leave a challenge
   */
  async leaveChallenge(userId: string, challengeId: string): Promise<void> {
    return this.request<void>(
      `/users/${userId}/challenges/${challengeId}/leave`,
      'POST'
    );
  }
  
  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(
    userId: string,
    usageData: CarbonUsage[]
  ): Promise<PersonalizedRecommendation[]> {
    return this.request<PersonalizedRecommendation[]>(
      `/users/${userId}/recommendations`,
      'POST',
      { usageData }
    );
  }
  
  /**
   * Implement a recommendation
   */
  async implementRecommendation(
    userId: string,
    recommendationId: string
  ): Promise<void> {
    return this.request<void>(
      `/users/${userId}/recommendations/${recommendationId}/implement`,
      'POST'
    );
  }
  
  /**
   * Save a recommendation for later
   */
  async saveRecommendation(
    userId: string,
    recommendationId: string
  ): Promise<void> {
    return this.request<void>(
      `/users/${userId}/recommendations/${recommendationId}/save`,
      'POST'
    );
  }
  
  /**
   * Dismiss a recommendation
   */
  async dismissRecommendation(
    userId: string,
    recommendationId: string
  ): Promise<void> {
    return this.request<void>(
      `/users/${userId}/recommendations/${recommendationId}/dismiss`,
      'POST'
    );
  }
  
  /**
   * Get user's scenario models
   */
  async getUserScenarioModels(userId: string): Promise<ScenarioModel[]> {
    return this.request<ScenarioModel[]>(`/users/${userId}/scenarios`);
  }
  
  /**
   * Create a new scenario model
   */
  async createScenarioModel(
    userId: string,
    data: {
      name: string;
      description: string;
      baselineCarbonInKg: number;
      parameters: Record<string, any>;
    }
  ): Promise<ScenarioModel> {
    return this.request<ScenarioModel>(
      `/users/${userId}/scenarios`,
      'POST',
      data
    );
  }
  
  /**
   * Update an existing scenario model
   */
  async updateScenarioModel(
    userId: string,
    scenarioId: string,
    data: {
      name?: string;
      description?: string;
      parameters?: Record<string, any>;
    }
  ): Promise<ScenarioModel> {
    return this.request<ScenarioModel>(
      `/users/${userId}/scenarios/${scenarioId}`,
      'PUT',
      data
    );
  }
  
  /**
   * Delete a scenario model
   */
  async deleteScenarioModel(
    userId: string,
    scenarioId: string
  ): Promise<void> {
    return this.request<void>(
      `/users/${userId}/scenarios/${scenarioId}`,
      'DELETE'
    );
  }
  
  /**
   * Get user's notifications
   */
  async getUserNotifications(userId: string): Promise<any[]> {
    return this.request<any[]>(`/users/${userId}/notifications`);
  }
  
  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(
    userId: string,
    notificationId: string
  ): Promise<void> {
    return this.request<void>(
      `/users/${userId}/notifications/${notificationId}/read`,
      'POST'
    );
  }
  
  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    return this.request<void>(
      `/users/${userId}/notifications/read-all`,
      'POST'
    );
  }
  
  /**
   * Dismiss a notification
   */
  async dismissNotification(
    userId: string,
    notificationId: string
  ): Promise<void> {
    return this.request<void>(
      `/users/${userId}/notifications/${notificationId}`,
      'DELETE'
    );
  }
  
  /**
   * Get leaderboard data
   */
  async getLeaderboard(period: string = 'month'): Promise<any[]> {
    return this.request<any[]>(`/leaderboard?period=${period}`);
  }
}

// Export a singleton instance
export const gamificationApi = new GamificationApi();
