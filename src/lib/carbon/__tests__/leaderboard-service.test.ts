import { LeaderboardService } from '../leaderboard-service';
import { GamificationApiClient } from '../../api/gamification-api';

// Mock the GamificationApiClient
jest.mock('../../api/gamification-api');
const MockedGamificationApiClient = GamificationApiClient as jest.MockedClass<typeof GamificationApiClient>;

describe('LeaderboardService', () => {
  let leaderboardService: LeaderboardService;
  let mockApiClient: jest.Mocked<GamificationApiClient>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of the mock API client
    mockApiClient = new MockedGamificationApiClient() as jest.Mocked<GamificationApiClient>;
    
    // Set up the mock implementation for the getInstance method
    MockedGamificationApiClient.getInstance.mockReturnValue(mockApiClient);
    
    // Create a new instance of the LeaderboardService
    leaderboardService = LeaderboardService.getInstance();
  });

  describe('getLeaderboard', () => {
    it('should fetch leaderboard data from the API when mock data is disabled', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      const mockLeaderboardData = [
        { 
          rank: 1, 
          userId: 'user-1', 
          username: 'User One', 
          points: 1000, 
          carbonReduced: 500,
          rankChange: 0,
          avatarUrl: 'https://example.com/avatar1.png'
        },
        { 
          rank: 2, 
          userId: 'user-2', 
          username: 'User Two', 
          points: 800, 
          carbonReduced: 400,
          rankChange: 1,
          avatarUrl: 'https://example.com/avatar2.png'
        }
      ];
      mockApiClient.getLeaderboard.mockResolvedValue(mockLeaderboardData);
      
      // Call the method
      const result = await leaderboardService.getLeaderboard('week');
      
      // Verify the API was called with the correct parameters
      expect(mockApiClient.getLeaderboard).toHaveBeenCalledWith('week');
      
      // Verify the result is correct
      expect(result).toEqual(mockLeaderboardData);
    });
    
    it('should return mock leaderboard data when mock data is enabled', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true';
      
      // Call the method
      const result = await leaderboardService.getLeaderboard('week');
      
      // Verify the API was not called
      expect(mockApiClient.getLeaderboard).not.toHaveBeenCalled();
      
      // Verify the result contains mock data
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('rank');
      expect(result[0]).toHaveProperty('userId');
      expect(result[0]).toHaveProperty('username');
      expect(result[0]).toHaveProperty('points');
      expect(result[0]).toHaveProperty('carbonReduced');
    });
    
    it('should cache results for subsequent calls with the same period', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      const mockLeaderboardData = [
        { 
          rank: 1, 
          userId: 'user-1', 
          username: 'User One', 
          points: 1000, 
          carbonReduced: 500,
          rankChange: 0,
          avatarUrl: 'https://example.com/avatar1.png'
        }
      ];
      mockApiClient.getLeaderboard.mockResolvedValue(mockLeaderboardData);
      
      // Call the method twice with the same period
      const result1 = await leaderboardService.getLeaderboard('week');
      const result2 = await leaderboardService.getLeaderboard('week');
      
      // Verify the API was called only once
      expect(mockApiClient.getLeaderboard).toHaveBeenCalledTimes(1);
      
      // Verify both results are correct
      expect(result1).toEqual(mockLeaderboardData);
      expect(result2).toEqual(mockLeaderboardData);
    });
    
    it('should make separate API calls for different periods', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API responses
      const mockWeekData = [{ rank: 1, userId: 'user-1', username: 'User One', points: 1000 }];
      const mockMonthData = [{ rank: 1, userId: 'user-2', username: 'User Two', points: 2000 }];
      
      mockApiClient.getLeaderboard.mockImplementation((period) => {
        if (period === 'week') return Promise.resolve(mockWeekData);
        if (period === 'month') return Promise.resolve(mockMonthData);
        return Promise.resolve([]);
      });
      
      // Call the method with different periods
      const weekResult = await leaderboardService.getLeaderboard('week');
      const monthResult = await leaderboardService.getLeaderboard('month');
      
      // Verify the API was called twice with different parameters
      expect(mockApiClient.getLeaderboard).toHaveBeenCalledTimes(2);
      expect(mockApiClient.getLeaderboard).toHaveBeenCalledWith('week');
      expect(mockApiClient.getLeaderboard).toHaveBeenCalledWith('month');
      
      // Verify the results are correct
      expect(weekResult).toEqual(mockWeekData);
      expect(monthResult).toEqual(mockMonthData);
    });
  });

  describe('getUserRank', () => {
    it('should return the user\'s rank from the leaderboard data', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      const mockLeaderboardData = [
        { rank: 1, userId: 'user-1', username: 'User One', points: 1000 },
        { rank: 2, userId: 'user-2', username: 'User Two', points: 800 },
        { rank: 3, userId: 'user-3', username: 'User Three', points: 600 }
      ];
      mockApiClient.getLeaderboard.mockResolvedValue(mockLeaderboardData);
      
      // Call the method
      const result = await leaderboardService.getUserRank('user-2', 'week');
      
      // Verify the result is correct
      expect(result).toEqual({
        rank: 2,
        userId: 'user-2',
        username: 'User Two',
        points: 800
      });
    });
    
    it('should return null if the user is not found in the leaderboard', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      const mockLeaderboardData = [
        { rank: 1, userId: 'user-1', username: 'User One', points: 1000 },
        { rank: 2, userId: 'user-2', username: 'User Two', points: 800 }
      ];
      mockApiClient.getLeaderboard.mockResolvedValue(mockLeaderboardData);
      
      // Call the method with a user ID that doesn't exist in the leaderboard
      const result = await leaderboardService.getUserRank('user-999', 'week');
      
      // Verify the result is null
      expect(result).toBeNull();
    });
  });
});
