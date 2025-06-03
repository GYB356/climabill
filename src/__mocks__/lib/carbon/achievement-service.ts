import { GamificationApiClient } from '../../api/gamification-api';

// Mock AchievementService
export class AchievementService {
  private static instance: AchievementService;
  private apiClient: GamificationApiClient;
  
  private constructor() {
    this.apiClient = GamificationApiClient.getInstance();
  }
  
  public static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }
  
  async getUserAchievements(userId: string) {
    return this.apiClient.getUserAchievements(userId);
  }
  
  async getUserProfile(userId: string) {
    return this.apiClient.getUserProfile(userId);
  }
  
  async getUserChallenges(userId: string) {
    return this.apiClient.getUserChallenges(userId);
  }
  
  async joinChallenge(userId: string, challengeId: string) {
    return this.apiClient.joinChallenge(userId, challengeId);
  }
  
  async leaveChallenge(userId: string, challengeId: string) {
    return this.apiClient.leaveChallenge(userId, challengeId);
  }
  
  async getPersonalizedRecommendations(userId: string) {
    return this.apiClient.getRecommendations(userId);
  }
  
  async implementRecommendation(userId: string, recommendationId: string) {
    return this.apiClient.implementRecommendation(userId, recommendationId);
  }
  
  async saveRecommendationForLater(userId: string, recommendationId: string) {
    return this.apiClient.saveRecommendationForLater(userId, recommendationId);
  }
  
  async dismissRecommendation(userId: string, recommendationId: string) {
    return this.apiClient.dismissRecommendation(userId, recommendationId);
  }
  
  async getUserScenarios(userId: string) {
    return this.apiClient.getUserScenarios(userId);
  }
  
  async saveScenario(userId: string, scenario: any) {
    return this.apiClient.saveScenario(userId, scenario);
  }
  
  async deleteScenario(userId: string, scenarioId: string) {
    return this.apiClient.deleteScenario(userId, scenarioId);
  }
}
