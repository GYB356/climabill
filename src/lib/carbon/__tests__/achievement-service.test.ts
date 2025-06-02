import { AchievementService } from '../achievement-service';
import { GamificationApiClient } from '../../api/gamification-api';

// Mock the GamificationApiClient
jest.mock('../../api/gamification-api');
const MockedGamificationApiClient = GamificationApiClient as jest.MockedClass<typeof GamificationApiClient>;

describe('AchievementService', () => {
  let achievementService: AchievementService;
  let mockApiClient: jest.Mocked<GamificationApiClient>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of the mock API client
    mockApiClient = new MockedGamificationApiClient() as jest.Mocked<GamificationApiClient>;
    
    // Set up the mock implementation for the getInstance method
    MockedGamificationApiClient.getInstance.mockReturnValue(mockApiClient);
    
    // Create a new instance of the AchievementService
    achievementService = AchievementService.getInstance();
  });

  describe('getUserAchievements', () => {
    it('should fetch user achievements from the API when mock data is disabled', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      const mockAchievements = [
        { id: '1', title: 'Achievement 1', description: 'Description 1', points: 10, unlocked: true },
        { id: '2', title: 'Achievement 2', description: 'Description 2', points: 20, unlocked: false }
      ];
      mockApiClient.getUserAchievements.mockResolvedValue(mockAchievements);
      
      // Call the method
      const result = await achievementService.getUserAchievements('user-123');
      
      // Verify the API was called with the correct parameters
      expect(mockApiClient.getUserAchievements).toHaveBeenCalledWith('user-123');
      
      // Verify the result is correct
      expect(result).toEqual(mockAchievements);
    });
    
    it('should return mock achievements when mock data is enabled', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true';
      
      // Call the method
      const result = await achievementService.getUserAchievements('user-123');
      
      // Verify the API was not called
      expect(mockApiClient.getUserAchievements).not.toHaveBeenCalled();
      
      // Verify the result contains mock data
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('points');
    });
    
    it('should cache results for subsequent calls', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      const mockAchievements = [
        { id: '1', title: 'Achievement 1', description: 'Description 1', points: 10, unlocked: true }
      ];
      mockApiClient.getUserAchievements.mockResolvedValue(mockAchievements);
      
      // Call the method twice
      const result1 = await achievementService.getUserAchievements('user-123');
      const result2 = await achievementService.getUserAchievements('user-123');
      
      // Verify the API was called only once
      expect(mockApiClient.getUserAchievements).toHaveBeenCalledTimes(1);
      
      // Verify both results are correct
      expect(result1).toEqual(mockAchievements);
      expect(result2).toEqual(mockAchievements);
    });
  });

  describe('getUserChallenges', () => {
    it('should fetch user challenges from the API when mock data is disabled', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      const mockChallenges = [
        { 
          id: '1', 
          title: 'Challenge 1', 
          description: 'Description 1', 
          startDate: '2023-01-01', 
          endDate: '2023-01-31',
          participants: 10,
          joined: true
        }
      ];
      mockApiClient.getUserChallenges.mockResolvedValue(mockChallenges);
      
      // Call the method
      const result = await achievementService.getUserChallenges('user-123');
      
      // Verify the API was called with the correct parameters
      expect(mockApiClient.getUserChallenges).toHaveBeenCalledWith('user-123');
      
      // Verify the result is correct
      expect(result).toEqual(mockChallenges);
    });
  });

  describe('joinChallenge', () => {
    it('should call the API to join a challenge', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      mockApiClient.joinChallenge.mockResolvedValue({ success: true });
      
      // Call the method
      const result = await achievementService.joinChallenge('user-123', 'challenge-456');
      
      // Verify the API was called with the correct parameters
      expect(mockApiClient.joinChallenge).toHaveBeenCalledWith('user-123', 'challenge-456');
      
      // Verify the result is correct
      expect(result).toEqual({ success: true });
    });
    
    it('should handle errors when joining a challenge', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API to throw an error
      mockApiClient.joinChallenge.mockRejectedValue(new Error('API error'));
      
      // Call the method and expect it to throw
      await expect(achievementService.joinChallenge('user-123', 'challenge-456'))
        .rejects.toThrow('API error');
    });
  });

  describe('leaveChallenge', () => {
    it('should call the API to leave a challenge', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      mockApiClient.leaveChallenge.mockResolvedValue({ success: true });
      
      // Call the method
      const result = await achievementService.leaveChallenge('user-123', 'challenge-456');
      
      // Verify the API was called with the correct parameters
      expect(mockApiClient.leaveChallenge).toHaveBeenCalledWith('user-123', 'challenge-456');
      
      // Verify the result is correct
      expect(result).toEqual({ success: true });
    });
  });

  describe('getPersonalizedRecommendations', () => {
    it('should fetch recommendations from the API when mock data is disabled', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      const mockRecommendations = [
        { 
          id: '1', 
          title: 'Recommendation 1', 
          description: 'Description 1', 
          difficulty: 'easy',
          impact: 'high',
          potentialSavings: 100
        }
      ];
      mockApiClient.getRecommendations.mockResolvedValue(mockRecommendations);
      
      // Call the method
      const result = await achievementService.getPersonalizedRecommendations('user-123');
      
      // Verify the API was called with the correct parameters
      expect(mockApiClient.getRecommendations).toHaveBeenCalledWith('user-123');
      
      // Verify the result is correct
      expect(result).toEqual(mockRecommendations);
    });
  });

  describe('implementRecommendation', () => {
    it('should call the API to implement a recommendation', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      mockApiClient.implementRecommendation.mockResolvedValue({ success: true });
      
      // Call the method
      const result = await achievementService.implementRecommendation('user-123', 'rec-456');
      
      // Verify the API was called with the correct parameters
      expect(mockApiClient.implementRecommendation).toHaveBeenCalledWith('user-123', 'rec-456');
      
      // Verify the result is correct
      expect(result).toEqual({ success: true });
    });
  });

  describe('saveRecommendationForLater', () => {
    it('should call the API to save a recommendation for later', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      mockApiClient.saveRecommendation.mockResolvedValue({ success: true });
      
      // Call the method
      const result = await achievementService.saveRecommendationForLater('user-123', 'rec-456');
      
      // Verify the API was called with the correct parameters
      expect(mockApiClient.saveRecommendation).toHaveBeenCalledWith('user-123', 'rec-456');
      
      // Verify the result is correct
      expect(result).toEqual({ success: true });
    });
  });

  describe('dismissRecommendation', () => {
    it('should call the API to dismiss a recommendation', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      mockApiClient.dismissRecommendation.mockResolvedValue({ success: true });
      
      // Call the method
      const result = await achievementService.dismissRecommendation('user-123', 'rec-456');
      
      // Verify the API was called with the correct parameters
      expect(mockApiClient.dismissRecommendation).toHaveBeenCalledWith('user-123', 'rec-456');
      
      // Verify the result is correct
      expect(result).toEqual({ success: true });
    });
  });
});
