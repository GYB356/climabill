// Mock GamificationApiClient
export class GamificationApiClient {
  private static instance: GamificationApiClient;
  
  private constructor() {}
  
  public static getInstance(): GamificationApiClient {
    if (!GamificationApiClient.instance) {
      GamificationApiClient.instance = new GamificationApiClient();
    }
    return GamificationApiClient.instance;
  }
  
  async getUserAchievements(userId: string) {
    return [
      { id: '1', title: 'Achievement 1', description: 'Description 1', points: 10, unlocked: true },
      { id: '2', title: 'Achievement 2', description: 'Description 2', points: 20, unlocked: false }
    ];
  }
  
  async getUserProfile(userId: string) {
    return {
      id: userId,
      username: 'Test User',
      level: 5,
      points: 500,
      totalCarbonReduced: 1000,
      avatarUrl: 'https://example.com/avatar.png'
    };
  }
  
  async getUserChallenges(userId: string) {
    return [
      {
        id: '1',
        title: 'Challenge 1',
        description: 'Description 1',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        participants: 10,
        joined: true
      }
    ];
  }
  
  async joinChallenge(userId: string, challengeId: string) {
    return { success: true };
  }
  
  async leaveChallenge(userId: string, challengeId: string) {
    return { success: true };
  }
  
  async getRecommendations(userId: string) {
    return [
      {
        id: '1',
        title: 'Recommendation 1',
        description: 'Description 1',
        difficulty: 'easy',
        impact: 'high',
        potentialSavings: 100
      }
    ];
  }
  
  async implementRecommendation(userId: string, recommendationId: string) {
    return { success: true };
  }
  
  async saveRecommendationForLater(userId: string, recommendationId: string) {
    return { success: true };
  }
  
  async dismissRecommendation(userId: string, recommendationId: string) {
    return { success: true };
  }
  
  async getUserScenarios(userId: string) {
    return [
      {
        id: '1',
        name: 'Scenario 1',
        description: 'Description 1',
        createdAt: '2023-01-01',
        parameters: {},
        baseline: 1000,
        modified: 800,
        reduction: 200
      }
    ];
  }
  
  async saveScenario(userId: string, scenario: any) {
    return { success: true, id: '1' };
  }
  
  async deleteScenario(userId: string, scenarioId: string) {
    return { success: true };
  }
  
  async getNotifications(userId: string) {
    return [
      {
        id: '1',
        title: 'New Achievement',
        message: 'You earned a new achievement!',
        type: 'achievement',
        read: false,
        createdAt: '2023-01-01T12:00:00Z'
      }
    ];
  }
  
  async getUnreadCount(userId: string) {
    return 1;
  }
  
  async markAsRead(userId: string, notificationId: string) {
    return { success: true };
  }
  
  async dismissNotification(userId: string, notificationId: string) {
    return { success: true };
  }
  
  async markAllAsRead(userId: string) {
    return { success: true };
  }
  
  async getLeaderboard(period: string) {
    return [
      {
        rank: 1,
        userId: 'user-1',
        username: 'Test User',
        points: 500,
        carbonReduced: 1000,
        rankChange: 0,
        avatarUrl: 'https://example.com/avatar.png'
      },
      {
        rank: 2,
        userId: 'user-2',
        username: 'Another User',
        points: 400,
        carbonReduced: 800,
        rankChange: 1,
        avatarUrl: 'https://example.com/avatar2.png'
      }
    ];
  }
  
  async getUserRank(userId: string) {
    return {
      rank: 1,
      userId: userId,
      username: 'Test User',
      points: 500,
      carbonReduced: 1000,
      rankChange: 0,
      avatarUrl: 'https://example.com/avatar.png'
    };
  }
}
