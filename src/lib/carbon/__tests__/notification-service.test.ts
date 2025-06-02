import { NotificationService } from '../notification-service';
import { GamificationApiClient } from '../../api/gamification-api';

// Mock the GamificationApiClient
jest.mock('../../api/gamification-api');
const MockedGamificationApiClient = GamificationApiClient as jest.MockedClass<typeof GamificationApiClient>;

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockApiClient: jest.Mocked<GamificationApiClient>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of the mock API client
    mockApiClient = new MockedGamificationApiClient() as jest.Mocked<GamificationApiClient>;
    
    // Set up the mock implementation for the getInstance method
    MockedGamificationApiClient.getInstance.mockReturnValue(mockApiClient);
    
    // Create a new instance of the NotificationService
    notificationService = NotificationService.getInstance();
  });

  describe('getNotifications', () => {
    it('should fetch notifications from the API when mock data is disabled', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      const mockNotifications = [
        { 
          id: '1', 
          title: 'New Achievement', 
          message: 'You earned a new achievement!', 
          type: 'achievement',
          read: false,
          createdAt: '2023-01-01T12:00:00Z'
        },
        { 
          id: '2', 
          title: 'Challenge Completed', 
          message: 'You completed a challenge!', 
          type: 'challenge',
          read: true,
          createdAt: '2023-01-02T12:00:00Z'
        }
      ];
      mockApiClient.getNotifications.mockResolvedValue(mockNotifications);
      
      // Call the method
      const result = await notificationService.getNotifications('user-123');
      
      // Verify the API was called with the correct parameters
      expect(mockApiClient.getNotifications).toHaveBeenCalledWith('user-123');
      
      // Verify the result is correct
      expect(result).toEqual(mockNotifications);
    });
    
    it('should return mock notifications when mock data is enabled', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true';
      
      // Call the method
      const result = await notificationService.getNotifications('user-123');
      
      // Verify the API was not called
      expect(mockApiClient.getNotifications).not.toHaveBeenCalled();
      
      // Verify the result contains mock data
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('message');
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('read');
    });
    
    it('should cache results for subsequent calls', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      const mockNotifications = [
        { 
          id: '1', 
          title: 'New Achievement', 
          message: 'You earned a new achievement!', 
          type: 'achievement',
          read: false,
          createdAt: '2023-01-01T12:00:00Z'
        }
      ];
      mockApiClient.getNotifications.mockResolvedValue(mockNotifications);
      
      // Call the method twice
      const result1 = await notificationService.getNotifications('user-123');
      const result2 = await notificationService.getNotifications('user-123');
      
      // Verify the API was called only once
      expect(mockApiClient.getNotifications).toHaveBeenCalledTimes(1);
      
      // Verify both results are correct
      expect(result1).toEqual(mockNotifications);
      expect(result2).toEqual(mockNotifications);
    });
  });

  describe('markAsRead', () => {
    it('should call the API to mark a notification as read', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      mockApiClient.markNotificationAsRead.mockResolvedValue({ success: true });
      
      // Call the method
      const result = await notificationService.markAsRead('user-123', 'notification-456');
      
      // Verify the API was called with the correct parameters
      expect(mockApiClient.markNotificationAsRead).toHaveBeenCalledWith('user-123', 'notification-456');
      
      // Verify the result is correct
      expect(result).toEqual({ success: true });
    });
    
    it('should handle errors when marking a notification as read', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API to throw an error
      mockApiClient.markNotificationAsRead.mockRejectedValue(new Error('API error'));
      
      // Call the method and expect it to throw
      await expect(notificationService.markAsRead('user-123', 'notification-456'))
        .rejects.toThrow('API error');
    });
  });

  describe('dismissNotification', () => {
    it('should call the API to dismiss a notification', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      mockApiClient.dismissNotification.mockResolvedValue({ success: true });
      
      // Call the method
      const result = await notificationService.dismissNotification('user-123', 'notification-456');
      
      // Verify the API was called with the correct parameters
      expect(mockApiClient.dismissNotification).toHaveBeenCalledWith('user-123', 'notification-456');
      
      // Verify the result is correct
      expect(result).toEqual({ success: true });
    });
  });

  describe('markAllAsRead', () => {
    it('should call the API to mark all notifications as read', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response
      mockApiClient.markAllNotificationsAsRead.mockResolvedValue({ success: true });
      
      // Call the method
      const result = await notificationService.markAllAsRead('user-123');
      
      // Verify the API was called with the correct parameters
      expect(mockApiClient.markAllNotificationsAsRead).toHaveBeenCalledWith('user-123');
      
      // Verify the result is correct
      expect(result).toEqual({ success: true });
    });
  });

  describe('getUnreadCount', () => {
    it('should return the count of unread notifications', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response for getNotifications
      const mockNotifications = [
        { id: '1', read: false },
        { id: '2', read: true },
        { id: '3', read: false }
      ];
      mockApiClient.getNotifications.mockResolvedValue(mockNotifications);
      
      // Call the method
      const result = await notificationService.getUnreadCount('user-123');
      
      // Verify the result is correct (2 unread notifications)
      expect(result).toBe(2);
    });
    
    it('should return 0 when there are no unread notifications', async () => {
      // Set up the environment variable
      process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      
      // Set up the mock API response for getNotifications
      const mockNotifications = [
        { id: '1', read: true },
        { id: '2', read: true }
      ];
      mockApiClient.getNotifications.mockResolvedValue(mockNotifications);
      
      // Call the method
      const result = await notificationService.getUnreadCount('user-123');
      
      // Verify the result is correct (0 unread notifications)
      expect(result).toBe(0);
    });
  });
});
