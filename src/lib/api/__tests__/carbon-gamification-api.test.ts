import { GamificationApiClient } from '../gamification-api';
import fetchMock from 'jest-fetch-mock';

// Enable fetch mocks
fetchMock.enableMocks();

describe('GamificationApiClient', () => {
  let apiClient: GamificationApiClient;
  
  beforeEach(() => {
    // Clear all mocks before each test
    fetchMock.resetMocks();
    
    // Create a new instance of the API client
    apiClient = GamificationApiClient.getInstance();
    
    // Mock the environment variables
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    
    // Mock localStorage for auth token
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-auth-token'),
      },
      writable: true
    });
  });
  
  describe('getUserAchievements', () => {
    it('should fetch user achievements from the API', async () => {
      // Set up the mock response
      const mockResponse = [
        { id: '1', title: 'Achievement 1', description: 'Description 1', points: 10, unlocked: true },
        { id: '2', title: 'Achievement 2', description: 'Description 2', points: 20, unlocked: false }
      ];
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
      
      // Call the method
      const result = await apiClient.getUserAchievements('user-123');
      
      // Verify the fetch was called with the correct parameters
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/gamification/users/user-123/achievements',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-auth-token'
          })
        })
      );
      
      // Verify the result is correct
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle API errors', async () => {
      // Set up the mock to throw an error
      fetchMock.mockRejectOnce(new Error('Network error'));
      
      // Call the method and expect it to throw
      await expect(apiClient.getUserAchievements('user-123'))
        .rejects.toThrow('Failed to fetch user achievements: Network error');
    });
  });
  
  describe('getUserChallenges', () => {
    it('should fetch user challenges from the API', async () => {
      // Set up the mock response
      const mockResponse = [
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
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
      
      // Call the method
      const result = await apiClient.getUserChallenges('user-123');
      
      // Verify the fetch was called with the correct parameters
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/gamification/users/user-123/challenges',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-auth-token'
          })
        })
      );
      
      // Verify the result is correct
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('joinChallenge', () => {
    it('should call the API to join a challenge', async () => {
      // Set up the mock response
      const mockResponse = { success: true };
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
      
      // Call the method
      const result = await apiClient.joinChallenge('user-123', 'challenge-456');
      
      // Verify the fetch was called with the correct parameters
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/gamification/users/user-123/challenges/challenge-456/join',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-auth-token',
            'Content-Type': 'application/json'
          })
        })
      );
      
      // Verify the result is correct
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('leaveChallenge', () => {
    it('should call the API to leave a challenge', async () => {
      // Set up the mock response
      const mockResponse = { success: true };
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
      
      // Call the method
      const result = await apiClient.leaveChallenge('user-123', 'challenge-456');
      
      // Verify the fetch was called with the correct parameters
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/gamification/users/user-123/challenges/challenge-456/leave',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-auth-token',
            'Content-Type': 'application/json'
          })
        })
      );
      
      // Verify the result is correct
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('getRecommendations', () => {
    it('should fetch recommendations from the API', async () => {
      // Set up the mock response
      const mockResponse = [
        { 
          id: '1', 
          title: 'Recommendation 1', 
          description: 'Description 1', 
          difficulty: 'easy',
          impact: 'high',
          potentialSavings: 100
        }
      ];
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
      
      // Call the method
      const result = await apiClient.getRecommendations('user-123');
      
      // Verify the fetch was called with the correct parameters
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/gamification/users/user-123/recommendations',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-auth-token'
          })
        })
      );
      
      // Verify the result is correct
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('getNotifications', () => {
    it('should fetch notifications from the API', async () => {
      // Set up the mock response
      const mockResponse = [
        { 
          id: '1', 
          title: 'New Achievement', 
          message: 'You earned a new achievement!', 
          type: 'achievement',
          read: false,
          createdAt: '2023-01-01T12:00:00Z'
        }
      ];
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
      
      // Call the method
      const result = await apiClient.getNotifications('user-123');
      
      // Verify the fetch was called with the correct parameters
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/gamification/users/user-123/notifications',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-auth-token'
          })
        })
      );
      
      // Verify the result is correct
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('getLeaderboard', () => {
    it('should fetch leaderboard data from the API', async () => {
      // Set up the mock response
      const mockResponse = [
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
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
      
      // Call the method
      const result = await apiClient.getLeaderboard('week');
      
      // Verify the fetch was called with the correct parameters
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/gamification/leaderboard?period=week',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-auth-token'
          })
        })
      );
      
      // Verify the result is correct
      expect(result).toEqual(mockResponse);
    });
  });
});
