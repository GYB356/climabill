import { GamificationApiClient } from '../../api/gamification-api';

// Mock LeaderboardService
export class LeaderboardService {
  private static instance: LeaderboardService;
  private apiClient: GamificationApiClient;
  
  private constructor() {
    this.apiClient = GamificationApiClient.getInstance();
  }
  
  public static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }
  
  async getLeaderboard(period: string) {
    return this.apiClient.getLeaderboard(period);
  }
  
  async getUserRank(userId: string) {
    return this.apiClient.getUserRank(userId);
  }
}
