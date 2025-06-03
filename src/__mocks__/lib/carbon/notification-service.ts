import { GamificationApiClient } from '../../api/gamification-api';

// Mock NotificationService
export class NotificationService {
  private static instance: NotificationService;
  private apiClient: GamificationApiClient;
  
  private constructor() {
    this.apiClient = GamificationApiClient.getInstance();
  }
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  async getNotifications(userId: string) {
    return this.apiClient.getNotifications(userId);
  }
  
  async getUnreadCount(userId: string) {
    return this.apiClient.getUnreadCount(userId);
  }
  
  async markAsRead(userId: string, notificationId: string) {
    return this.apiClient.markAsRead(userId, notificationId);
  }
  
  async dismissNotification(userId: string, notificationId: string) {
    return this.apiClient.dismissNotification(userId, notificationId);
  }
  
  async markAllAsRead(userId: string) {
    return this.apiClient.markAllAsRead(userId);
  }
}
