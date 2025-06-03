import { cachedApiCall } from '../caching/carbonMetricsCache';
import { gamificationApi } from '../api/gamification-api';
import { CacheKeys, InvalidationGroups } from './cache-management';

// Feature flag to toggle between mock data and API calls
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  rank: number;
  previousRank: number;
  points: number;
  carbonReduced: number;
  carbonReducedPercentage: number;
  isCurrentUser: boolean;
}

export type LeaderboardPeriod = 'week' | 'month' | 'year' | 'all';

/**
 * Service for managing leaderboard data
 */
export class LeaderboardService {
  // Singleton instance
  private static instance: LeaderboardService;
  
  // Cache expiry time (in milliseconds)
  private static readonly LEADERBOARD_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {}
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }
  
  /**
   * Get leaderboard data for a specific period
   */
  async getLeaderboard(period: LeaderboardPeriod = 'month'): Promise<LeaderboardEntry[]> {
    const cacheKey = CacheKeys.leaderboard.global(period);
    
    return cachedApiCall<LeaderboardEntry[]>(
      cacheKey,
      () => this.fetchLeaderboard(period),
      LeaderboardService.LEADERBOARD_CACHE_EXPIRY
    );
  }
  
  /**
   * Fetch leaderboard data from API or mock data
   */
  private async fetchLeaderboard(period: LeaderboardPeriod): Promise<LeaderboardEntry[]> {
    // Use the API client if mock data is disabled
    if (!USE_MOCK_DATA) {
      try {
        const apiLeaderboard = await gamificationApi.getLeaderboard(period);
        return apiLeaderboard.map(this.mapApiLeaderboardEntryToModel);
      } catch (error) {
        console.error('Error fetching leaderboard from API:', error);
        // Fall back to mock data if API fails
      }
    }
    
    // Mock data implementation
    return this.getMockLeaderboard(period);
  }
  
  /**
   * Map API leaderboard entry to our model
   */
  private mapApiLeaderboardEntryToModel(apiEntry: any, index: number): LeaderboardEntry {
    return {
      userId: apiEntry.userId,
      username: apiEntry.username,
      avatarUrl: apiEntry.avatarUrl,
      rank: apiEntry.rank || index + 1,
      previousRank: apiEntry.previousRank || apiEntry.rank + Math.floor(Math.random() * 5) - 2,
      points: apiEntry.points,
      carbonReduced: apiEntry.carbonReduced,
      carbonReducedPercentage: apiEntry.carbonReducedPercentage,
      isCurrentUser: apiEntry.isCurrentUser
    };
  }
  
  /**
   * Get mock leaderboard data for testing
   */
  private getMockLeaderboard(period: LeaderboardPeriod): LeaderboardEntry[] {
    // Generate different data based on period
    const basePoints = period === 'week' ? 100 : period === 'month' ? 500 : period === 'year' ? 2000 : 5000;
    const baseCarbonReduced = period === 'week' ? 50 : period === 'month' ? 200 : period === 'year' ? 1000 : 2500;
    
    // Generate 10 leaderboard entries
    return Array.from({ length: 10 }, (_, i) => {
      const rank = i + 1;
      const isCurrentUser = rank === 3; // Make the current user rank 3rd
      
      // Calculate points and carbon reduced with some randomness
      const pointsMultiplier = Math.max(0.5, (11 - rank) / 10 + Math.random() * 0.2);
      const carbonMultiplier = Math.max(0.5, (11 - rank) / 10 + Math.random() * 0.2);
      
      return {
        userId: `user-${i + 1}`,
        username: isCurrentUser ? 'You' : this.getRandomUsername(),
        avatarUrl: isCurrentUser ? undefined : `https://randomuser.me/api/portraits/${i % 2 ? 'men' : 'women'}/${i + 1}.jpg`,
        rank,
        previousRank: Math.max(1, rank + (Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : -Math.floor(Math.random() * 3) - 1)),
        points: Math.floor(basePoints * pointsMultiplier),
        carbonReduced: Math.floor(baseCarbonReduced * carbonMultiplier),
        carbonReducedPercentage: Math.floor(15 * carbonMultiplier),
        isCurrentUser
      };
    });
  }
  
  /**
   * Get a random username for mock data
   */
  private getRandomUsername(): string {
    const firstNames = ['John', 'Jane', 'Alex', 'Sarah', 'Michael', 'Emma', 'David', 'Olivia', 'James', 'Sophia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName.charAt(0)}.`;
  }

  /**
   * Get a user's current rank in the leaderboard
   */
  async getUserRank(userId: string, period: LeaderboardPeriod = 'month'): Promise<number> {
    const cacheKey = CacheKeys.leaderboard.rank(userId);
    
    return cachedApiCall<number>(
      cacheKey,
      async () => {
        // Use the API client if mock data is disabled
        if (!USE_MOCK_DATA) {
          try {
            const response = await gamificationApi.getUserRank(userId, period);
            return response.rank;
          } catch (error) {
            console.error('Error fetching user rank from API:', error);
            // Fall back to mock data if API fails
          }
        }
        
        // For mock data, find the user in the leaderboard and return their rank
        const leaderboard = await this.getLeaderboard(period);
        const userEntry = leaderboard.find(entry => entry.userId === userId || entry.isCurrentUser);
        
        // Return the rank if found, otherwise a default value
        return userEntry?.rank || 0;
      },
      LeaderboardService.LEADERBOARD_CACHE_EXPIRY
    );
  }
}

// Export a singleton instance
export const leaderboardService = LeaderboardService.getInstance();
