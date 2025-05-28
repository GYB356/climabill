import axios from 'axios';
import { OAuthService } from '../oauth/oauth-service';
import { OAuthProvider, OAUTH_CONFIG } from '../oauth/config';
import { firestore } from '../../firebase/admin';

/**
 * Notification channel types
 */
export enum NotificationChannel {
  EMAIL = 'email',
  SLACK = 'slack',
}

/**
 * Notification priority levels
 */
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Notification template types
 */
export enum NotificationTemplate {
  INVOICE_CREATED = 'invoice_created',
  INVOICE_PAID = 'invoice_paid',
  INVOICE_OVERDUE = 'invoice_overdue',
  PAYMENT_RECEIVED = 'payment_received',
  CUSTOMER_CREATED = 'customer_created',
  CARBON_OFFSET_PURCHASED = 'carbon_offset_purchased',
  BLOCKCHAIN_TRANSACTION = 'blockchain_transaction',
}

/**
 * Interface for notification settings
 */
export interface NotificationSettings {
  enabled: boolean;
  channels: {
    [NotificationChannel.EMAIL]?: {
      enabled: boolean;
      recipients: string[];
    };
    [NotificationChannel.SLACK]?: {
      enabled: boolean;
      channels: string[];
    };
  };
  templates: {
    [template: string]: {
      enabled: boolean;
      priority: NotificationPriority;
      channels: NotificationChannel[];
    };
  };
}

/**
 * Interface for notification data
 */
export interface NotificationData {
  template: NotificationTemplate;
  subject: string;
  message: string;
  priority: NotificationPriority;
  data: Record<string, any>;
}

/**
 * Service for sending notifications through various channels
 */
export class NotificationService {
  private oauthService: OAuthService;
  
  constructor() {
    this.oauthService = new OAuthService();
  }
  
  /**
   * Get notification settings for a user
   * @param userId User ID
   * @returns Notification settings
   */
  async getNotificationSettings(userId: string): Promise<NotificationSettings> {
    try {
      const settingsDoc = await firestore
        .collection('users')
        .doc(userId)
        .collection('settings')
        .doc('notifications')
        .get();
      
      if (!settingsDoc.exists) {
        // Return default settings
        return {
          enabled: true,
          channels: {
            [NotificationChannel.EMAIL]: {
              enabled: true,
              recipients: [],
            },
            [NotificationChannel.SLACK]: {
              enabled: false,
              channels: [],
            },
          },
          templates: {
            [NotificationTemplate.INVOICE_CREATED]: {
              enabled: true,
              priority: NotificationPriority.MEDIUM,
              channels: [NotificationChannel.EMAIL],
            },
            [NotificationTemplate.INVOICE_PAID]: {
              enabled: true,
              priority: NotificationPriority.MEDIUM,
              channels: [NotificationChannel.EMAIL],
            },
            [NotificationTemplate.INVOICE_OVERDUE]: {
              enabled: true,
              priority: NotificationPriority.HIGH,
              channels: [NotificationChannel.EMAIL, NotificationChannel.SLACK],
            },
            [NotificationTemplate.PAYMENT_RECEIVED]: {
              enabled: true,
              priority: NotificationPriority.MEDIUM,
              channels: [NotificationChannel.EMAIL],
            },
            [NotificationTemplate.CUSTOMER_CREATED]: {
              enabled: true,
              priority: NotificationPriority.LOW,
              channels: [NotificationChannel.EMAIL],
            },
            [NotificationTemplate.CARBON_OFFSET_PURCHASED]: {
              enabled: true,
              priority: NotificationPriority.MEDIUM,
              channels: [NotificationChannel.EMAIL, NotificationChannel.SLACK],
            },
            [NotificationTemplate.BLOCKCHAIN_TRANSACTION]: {
              enabled: true,
              priority: NotificationPriority.MEDIUM,
              channels: [NotificationChannel.EMAIL, NotificationChannel.SLACK],
            },
          },
        };
      }
      
      return settingsDoc.data() as NotificationSettings;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      throw error;
    }
  }
  
  /**
   * Update notification settings for a user
   * @param userId User ID
   * @param settings Notification settings
   * @returns Updated notification settings
   */
  async updateNotificationSettings(
    userId: string,
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    try {
      const currentSettings = await this.getNotificationSettings(userId);
      
      // Merge settings
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        channels: {
          ...currentSettings.channels,
          ...(settings.channels || {}),
        },
        templates: {
          ...currentSettings.templates,
          ...(settings.templates || {}),
        },
      };
      
      // Save to Firestore
      await firestore
        .collection('users')
        .doc(userId)
        .collection('settings')
        .doc('notifications')
        .set(updatedSettings);
      
      return updatedSettings;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }
  
  /**
   * Send a notification
   * @param userId User ID
   * @param notification Notification data
   * @returns Result of notification sending
   */
  async sendNotification(
    userId: string,
    notification: NotificationData
  ): Promise<{
    success: boolean;
    results: {
      channel: NotificationChannel;
      success: boolean;
      error?: string;
    }[];
  }> {
    try {
      // Get notification settings
      const settings = await this.getNotificationSettings(userId);
      
      // Check if notifications are enabled
      if (!settings.enabled) {
        return {
          success: false,
          results: [
            {
              channel: NotificationChannel.EMAIL,
              success: false,
              error: 'Notifications are disabled',
            },
          ],
        };
      }
      
      // Check if template is enabled
      const templateSettings = settings.templates[notification.template];
      if (!templateSettings || !templateSettings.enabled) {
        return {
          success: false,
          results: [
            {
              channel: NotificationChannel.EMAIL,
              success: false,
              error: `Template ${notification.template} is disabled`,
            },
          ],
        };
      }
      
      // Determine channels to use
      const channels = templateSettings.channels;
      
      // Send to each channel
      const results = await Promise.all(
        channels.map(async (channel) => {
          try {
            const channelSettings = settings.channels[channel];
            
            if (!channelSettings || !channelSettings.enabled) {
              return {
                channel,
                success: false,
                error: `Channel ${channel} is disabled`,
              };
            }
            
            switch (channel) {
              case NotificationChannel.EMAIL:
                return await this.sendEmailNotification(
                  userId,
                  notification,
                  channelSettings.recipients
                );
              case NotificationChannel.SLACK:
                return await this.sendSlackNotification(
                  userId,
                  notification,
                  channelSettings.channels
                );
              default:
                return {
                  channel,
                  success: false,
                  error: `Unknown channel ${channel}`,
                };
            }
          } catch (error) {
            console.error(`Error sending ${channel} notification:`, error);
            return {
              channel,
              success: false,
              error: error.message,
            };
          }
        })
      );
      
      // Log notification
      await this.logNotification(userId, notification, results);
      
      // Return results
      return {
        success: results.some((result) => result.success),
        results,
      };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
  
  /**
   * Send an email notification
   * @param userId User ID
   * @param notification Notification data
   * @param recipients Email recipients
   * @returns Result of email sending
   */
  private async sendEmailNotification(
    userId: string,
    notification: NotificationData,
    recipients: string[]
  ): Promise<{
    channel: NotificationChannel;
    success: boolean;
    error?: string;
  }> {
    try {
      // Get user email if no recipients specified
      if (!recipients || recipients.length === 0) {
        const userDoc = await firestore.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
          throw new Error('User not found');
        }
        
        const userData = userDoc.data();
        if (!userData || !userData.email) {
          throw new Error('User email not found');
        }
        
        recipients = [userData.email];
      }
      
      // Prepare email data
      const emailData = {
        to: recipients,
        subject: notification.subject,
        text: notification.message,
        html: this.renderEmailTemplate(notification),
        data: notification.data,
      };
      
      // Send email via Firebase Cloud Function
      await firestore.collection('mail').add(emailData);
      
      return {
        channel: NotificationChannel.EMAIL,
        success: true,
      };
    } catch (error) {
      console.error('Error sending email notification:', error);
      return {
        channel: NotificationChannel.EMAIL,
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Send a Slack notification
   * @param userId User ID
   * @param notification Notification data
   * @param channels Slack channels
   * @returns Result of Slack sending
   */
  private async sendSlackNotification(
    userId: string,
    notification: NotificationData,
    channels: string[]
  ): Promise<{
    channel: NotificationChannel;
    success: boolean;
    error?: string;
  }> {
    try {
      // Check if Slack is connected
      const accessToken = await this.oauthService.getAccessToken(
        userId,
        OAuthProvider.SLACK
      );
      
      if (!accessToken) {
        throw new Error('Slack integration not connected');
      }
      
      // Prepare Slack message
      const slackMessage = this.renderSlackMessage(notification);
      
      // Send to each channel
      const results = await Promise.all(
        channels.map(async (channel) => {
          try {
            await axios({
              method: 'POST',
              url: 'https://slack.com/api/chat.postMessage',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              data: {
                channel,
                text: notification.subject,
                blocks: slackMessage,
              },
            });
            
            return { success: true };
          } catch (error) {
            console.error(`Error sending Slack message to ${channel}:`, error);
            return { success: false, error: error.message };
          }
        })
      );
      
      // Check if any channel succeeded
      const success = results.some((result) => result.success);
      
      return {
        channel: NotificationChannel.SLACK,
        success,
        error: success ? undefined : 'Failed to send to all Slack channels',
      };
    } catch (error) {
      console.error('Error sending Slack notification:', error);
      return {
        channel: NotificationChannel.SLACK,
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Log a notification to Firestore
   * @param userId User ID
   * @param notification Notification data
   * @param results Results of sending
   */
  private async logNotification(
    userId: string,
    notification: NotificationData,
    results: {
      channel: NotificationChannel;
      success: boolean;
      error?: string;
    }[]
  ): Promise<void> {
    try {
      await firestore.collection('users').doc(userId).collection('notifications').add({
        template: notification.template,
        subject: notification.subject,
        message: notification.message,
        priority: notification.priority,
        data: notification.data,
        results,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }
  
  /**
   * Render an email template
   * @param notification Notification data
   * @returns HTML email content
   */
  private renderEmailTemplate(notification: NotificationData): string {
    // This is a simple template, in a real app you would use a proper templating engine
    const priorityColor = {
      [NotificationPriority.LOW]: '#4CAF50',
      [NotificationPriority.MEDIUM]: '#2196F3',
      [NotificationPriority.HIGH]: '#F44336',
    };
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${notification.subject}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: ${priorityColor[notification.priority]};
              color: white;
              padding: 10px 20px;
              border-radius: 4px 4px 0 0;
            }
            .content {
              padding: 20px;
              border: 1px solid #ddd;
              border-top: none;
              border-radius: 0 0 4px 4px;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #777;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${notification.subject}</h2>
          </div>
          <div class="content">
            <p>${notification.message}</p>
            ${this.renderNotificationData(notification.data)}
          </div>
          <div class="footer">
            <p>This is an automated message from ClimaBill. Please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `;
  }
  
  /**
   * Render notification data as HTML
   * @param data Notification data
   * @returns HTML content
   */
  private renderNotificationData(data: Record<string, any>): string {
    if (!data || Object.keys(data).length === 0) {
      return '';
    }
    
    let html = '<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">';
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null) {
        html += `<h4>${this.formatKey(key)}</h4>`;
        html += '<ul>';
        for (const [subKey, subValue] of Object.entries(value)) {
          html += `<li><strong>${this.formatKey(subKey)}:</strong> ${subValue}</li>`;
        }
        html += '</ul>';
      } else {
        html += `<p><strong>${this.formatKey(key)}:</strong> ${value}</p>`;
      }
    }
    
    html += '</div>';
    
    return html;
  }
  
  /**
   * Format a key for display
   * @param key Key to format
   * @returns Formatted key
   */
  private formatKey(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  
  /**
   * Render a Slack message
   * @param notification Notification data
   * @returns Slack message blocks
   */
  private renderSlackMessage(notification: NotificationData): any[] {
    const priorityColor = {
      [NotificationPriority.LOW]: '#4CAF50',
      [NotificationPriority.MEDIUM]: '#2196F3',
      [NotificationPriority.HIGH]: '#F44336',
    };
    
    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: notification.subject,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: notification.message,
        },
      },
      {
        type: 'divider',
      },
    ];
    
    // Add data fields
    if (notification.data && Object.keys(notification.data).length > 0) {
      const fields = [];
      
      for (const [key, value] of Object.entries(notification.data)) {
        if (typeof value !== 'object' || value === null) {
          fields.push({
            type: 'mrkdwn',
            text: `*${this.formatKey(key)}*\n${value}`,
          });
        }
      }
      
      if (fields.length > 0) {
        blocks.push({
          type: 'section',
          fields,
        });
      }
      
      // Add complex objects
      for (const [key, value] of Object.entries(notification.data)) {
        if (typeof value === 'object' && value !== null) {
          blocks.push({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${this.formatKey(key)}*`,
            },
          });
          
          const subFields = [];
          
          for (const [subKey, subValue] of Object.entries(value)) {
            subFields.push({
              type: 'mrkdwn',
              text: `*${this.formatKey(subKey)}*\n${subValue}`,
            });
          }
          
          if (subFields.length > 0) {
            blocks.push({
              type: 'section',
              fields: subFields,
            });
          }
        }
      }
    }
    
    // Add context
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Priority: ${notification.priority.toUpperCase()} | Template: ${notification.template}`,
        },
      ],
    });
    
    return blocks;
  }
  
  /**
   * Create a notification from a template
   * @param template Notification template
   * @param data Template data
   * @returns Notification data
   */
  createNotificationFromTemplate(
    template: NotificationTemplate,
    data: Record<string, any>
  ): NotificationData {
    switch (template) {
      case NotificationTemplate.INVOICE_CREATED:
        return {
          template,
          subject: `New Invoice Created: ${data.invoiceNumber}`,
          message: `A new invoice has been created for ${data.customerName} with a total amount of ${data.currency}${data.amount}.`,
          priority: NotificationPriority.MEDIUM,
          data,
        };
      
      case NotificationTemplate.INVOICE_PAID:
        return {
          template,
          subject: `Invoice Paid: ${data.invoiceNumber}`,
          message: `Invoice ${data.invoiceNumber} for ${data.customerName} has been paid in full.`,
          priority: NotificationPriority.MEDIUM,
          data,
        };
      
      case NotificationTemplate.INVOICE_OVERDUE:
        return {
          template,
          subject: `OVERDUE: Invoice ${data.invoiceNumber}`,
          message: `Invoice ${data.invoiceNumber} for ${data.customerName} is overdue by ${data.daysOverdue} days.`,
          priority: NotificationPriority.HIGH,
          data,
        };
      
      case NotificationTemplate.PAYMENT_RECEIVED:
        return {
          template,
          subject: `Payment Received: ${data.currency}${data.amount}`,
          message: `A payment of ${data.currency}${data.amount} has been received from ${data.customerName}.`,
          priority: NotificationPriority.MEDIUM,
          data,
        };
      
      case NotificationTemplate.CUSTOMER_CREATED:
        return {
          template,
          subject: `New Customer: ${data.customerName}`,
          message: `A new customer account has been created for ${data.customerName}.`,
          priority: NotificationPriority.LOW,
          data,
        };
      
      case NotificationTemplate.CARBON_OFFSET_PURCHASED:
        return {
          template,
          subject: `Carbon Offset Purchased: ${data.amount} tonnes`,
          message: `A carbon offset of ${data.amount} tonnes has been purchased for ${data.currency}${data.cost}.`,
          priority: NotificationPriority.MEDIUM,
          data,
        };
      
      case NotificationTemplate.BLOCKCHAIN_TRANSACTION:
        return {
          template,
          subject: `Blockchain Transaction: ${data.type}`,
          message: `A blockchain transaction of type ${data.type} has been ${data.status}.`,
          priority: NotificationPriority.MEDIUM,
          data,
        };
      
      default:
        throw new Error(`Unknown notification template: ${template}`);
    }
  }
}
