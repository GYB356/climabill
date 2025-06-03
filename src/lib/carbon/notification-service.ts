import { cachedApiCall } from '../caching/carbonMetricsCache';
import { gamificationApi } from '../api/gamification-api';
import { CacheKeys, InvalidationGroups } from './cache-management';

// Feature flag to toggle between mock data and API calls
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export interface Notification {
  id: string;
  type: 'achievement' | 'challenge' | 'recommendation' | 'alert' | 'goal';
  title: string;
  message: string;
  icon: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

/**
 * Service for managing user notifications
 */
export class NotificationService {
  // Singleton instance
  private static instance: NotificationService;
  
  // Cache expiry time (in milliseconds)
  private static readonly NOTIFICATIONS_CACHE_EXPIRY = 2 * 60 * 1000; // 2 minutes
  
  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {}
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  /**
   * Get user's notifications
   */
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const cacheKey = CacheKeys.notifications.user(userId);
    
    return cachedApiCall<Notification[]>(
      cacheKey,
      () => this.fetchUserNotifications(userId),
      NotificationService.NOTIFICATIONS_CACHE_EXPIRY
    );
  }
  
  /**
   * Mark a notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    if (!USE_MOCK_DATA) {
      try {
        await gamificationApi.markNotificationAsRead(userId, notificationId);
      } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    }
    
    // Invalidate related caches
    await InvalidationGroups.notifications(userId);
  }
  
  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    if (!USE_MOCK_DATA) {
      try {
        await gamificationApi.markAllNotificationsAsRead(userId);
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
    }
    
    // Invalidate related caches
    await InvalidationGroups.notifications(userId);
  }
  
  /**
   * Dismiss a notification
   */
  async dismissNotification(userId: string, notificationId: string): Promise<void> {
    if (!USE_MOCK_DATA) {
      try {
        await gamificationApi.dismissNotification(userId, notificationId);
      } catch (error) {
        console.error('Error dismissing notification:', error);
        throw error;
      }
    }
    
    // Invalidate related caches
    await InvalidationGroups.notifications(userId);
  }
  
  /**
   * Fetch user's notifications from API or mock data
   */
  private async fetchUserNotifications(userId: string): Promise<Notification[]> {
    // Use the API client if mock data is disabled
    if (!USE_MOCK_DATA) {
      try {
        const apiNotifications = await gamificationApi.getUserNotifications(userId);
        return apiNotifications.map(this.mapApiNotificationToModel);
      } catch (error) {
        console.error('Error fetching notifications from API:', error);
        // Fall back to mock data if API fails
      }
    }
    
    // Mock data implementation
    return this.getMockNotifications();
  }
  
  /**
   * Map API notification to our model
   */
  private mapApiNotificationToModel(apiNotification: any): Notification {
    return {
      id: apiNotification.id,
      type: apiNotification.type,
      title: apiNotification.title,
      message: apiNotification.message,
      icon: apiNotification.icon || NotificationService.getIconForType(apiNotification.type),
      timestamp: new Date(apiNotification.timestamp),
      read: apiNotification.read,
      actionUrl: apiNotification.actionUrl,
      actionLabel: apiNotification.actionLabel
    };
  }
  
  /**
   * Get icon for notification type
   */
  private static getIconForType(type: string): string {
    switch (type) {
      case 'achievement':
        return 'award';
      case 'challenge':
        return 'flag';
      case 'recommendation':
        return 'lightbulb';
      case 'alert':
        return 'alert-circle';
      case 'goal':
        return 'target';
      default:
        return 'bell';
    }
  }
  
  /**
   * Get mock notifications for testing
   */
  private getMockNotifications(): Notification[] {
    const now = new Date();
    
    return [
      {
        id: 'notif-1',
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: 'You\'ve earned the "Carbon Saver: Bronze" achievement.',
        icon: 'award',
        timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
        read: false,
        actionUrl: '/carbon/achievements',
        actionLabel: 'View Achievement'
      },
      {
        id: 'notif-2',
        type: 'challenge',
        title: 'New Challenge Available',
        message: 'Join the "Paperless Office" challenge and reduce your paper usage.',
        icon: 'flag',
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        read: true,
        actionUrl: '/carbon/challenges',
        actionLabel: 'Join Challenge'
      },
      {
        id: 'notif-3',
        type: 'recommendation',
        title: 'New Recommendation',
        message: 'Switching to LED lighting could reduce your energy usage by 15%.',
        icon: 'lightbulb',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        read: false,
        actionUrl: '/carbon/recommendations',
        actionLabel: 'View Details'
      },
      {
        id: 'notif-4',
        type: 'alert',
        title: 'Carbon Usage Alert',
        message: 'Your energy usage has increased by 20% compared to last month.',
        icon: 'alert-circle',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        read: false
      },
      {
        id: 'notif-5',
        type: 'goal',
        title: 'Goal Progress Update',
        message: 'You\'re 75% of the way to your carbon reduction goal!',
        icon: 'target',
        timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        read: true,
        actionUrl: '/carbon/goals',
        actionLabel: 'View Goal'
      }
    ];
  }
}

// Export a singleton instance
export const notificationService = NotificationService.getInstance();
