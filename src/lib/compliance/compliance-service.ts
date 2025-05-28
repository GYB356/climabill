import { prisma } from '../db/prisma';
import { logger } from '../monitoring/logger';
import { UserDataExport } from './types';
import { NotificationService } from '../integrations/notifications/notification-service';
import { encryptData, decryptData } from '../utils/encryption';
import { ConsentType, ConsentStatus } from '@prisma/client';

/**
 * ComplianceService handles GDPR and CCPA compliance requirements including:
 * - Data subject access requests
 * - Right to be forgotten
 * - Data portability
 * - Consent management
 * - Data processing records
 */
export class ComplianceService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Retrieves all personal data for a user (GDPR Article 15 / CCPA Section 1798.100)
   * @param userId The ID of the user requesting their data
   * @returns A structured export of all user data
   */
  async exportUserData(userId: string): Promise<UserDataExport> {
    try {
      logger.info('Processing data export request', { userId });
      
      // Record the access request for compliance records
      await this.recordDataRequest(userId, 'EXPORT');
      
      // Retrieve user's personal data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          customers: true,
          invoices: {
            include: {
              items: true,
              payments: true
            }
          },
          carbonUsage: true,
          carbonOffsets: true,
          wallets: {
            select: {
              id: true,
              name: true,
              address: true,
              network: true,
              createdAt: true,
              updatedAt: true
            }
          },
          integrations: true,
          notifications: true
        }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Mask sensitive data
      const maskedData = this.maskSensitiveData(user);
      
      // Format data for export
      const exportData: UserDataExport = {
        personalInformation: {
          id: maskedData.id,
          email: maskedData.email,
          name: maskedData.name || '',
          createdAt: maskedData.createdAt,
          updatedAt: maskedData.updatedAt
        },
        customers: maskedData.customers.map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt
        })),
        invoices: maskedData.invoices.map(invoice => ({
          id: invoice.id,
          number: invoice.number,
          amount: invoice.amount,
          status: invoice.status,
          createdAt: invoice.createdAt,
          items: invoice.items.map(item => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          })),
          payments: invoice.payments.map(payment => ({
            id: payment.id,
            amount: payment.amount,
            method: payment.method,
            date: payment.date
          }))
        })),
        carbonData: {
          usage: maskedData.carbonUsage.map(usage => ({
            id: usage.id,
            source: usage.source,
            amount: usage.amount,
            date: usage.date
          })),
          offsets: maskedData.carbonOffsets.map(offset => ({
            id: offset.id,
            provider: offset.provider,
            amount: offset.amount,
            date: offset.date,
            certificate: offset.certificate
          }))
        },
        wallets: maskedData.wallets.map(wallet => ({
          id: wallet.id,
          name: wallet.name,
          address: wallet.address,
          network: wallet.network,
          createdAt: wallet.createdAt
        })),
        integrations: maskedData.integrations.map(integration => ({
          id: integration.id,
          provider: integration.provider,
          status: integration.status,
          createdAt: integration.createdAt
        })),
        consents: await this.getUserConsents(userId)
      };
      
      // Notify user that their data has been exported
      await this.notificationService.sendNotification(userId, {
        type: 'DATA_EXPORT_COMPLETE',
        title: 'Your Data Export is Ready',
        message: 'Your requested data export has been processed and is now available for download.',
        priority: 'high'
      });
      
      logger.info('Data export completed successfully', { userId });
      
      return exportData;
    } catch (error) {
      logger.error('Error exporting user data', { userId, error });
      throw new Error(`Failed to export user data: ${error.message}`);
    }
  }
  
  /**
   * Deletes a user's personal data (GDPR Article 17 / CCPA Section 1798.105)
   * @param userId The ID of the user requesting deletion
   * @param retainRequiredData Whether to retain data required for legal/business purposes
   * @returns Success status
   */
  async deleteUserData(userId: string, retainRequiredData = true): Promise<boolean> {
    try {
      logger.info('Processing data deletion request', { userId, retainRequiredData });
      
      // Record the deletion request for compliance records
      await this.recordDataRequest(userId, 'DELETE');
      
      // Begin transaction to ensure all data is deleted or none
      await prisma.$transaction(async (tx) => {
        // Anonymize user data instead of hard delete if retaining required data
        if (retainRequiredData) {
          // Anonymize personal information
          await tx.user.update({
            where: { id: userId },
            data: {
              email: `anonymized-${Date.now()}@deleted.climabill.com`,
              name: 'Anonymized User',
              settings: null
            }
          });
          
          // Mark user as deleted but retain transaction history
          await tx.user.update({
            where: { id: userId },
            data: {
              deleted: true,
              deletedAt: new Date()
            }
          });
        } else {
          // Hard delete all user data (cascading delete should handle relations)
          // Delete notifications
          await tx.notification.deleteMany({
            where: { userId }
          });
          
          // Delete integrations
          await tx.integration.deleteMany({
            where: { userId }
          });
          
          // Delete wallets
          await tx.wallet.deleteMany({
            where: { userId }
          });
          
          // Delete carbon offsets
          await tx.carbonOffset.deleteMany({
            where: { userId }
          });
          
          // Delete carbon usage
          await tx.carbonUsage.deleteMany({
            where: { userId }
          });
          
          // Delete payments
          await tx.payment.deleteMany({
            where: { userId }
          });
          
          // Delete invoice items (need to get invoice IDs first)
          const invoices = await tx.invoice.findMany({
            where: { userId },
            select: { id: true }
          });
          
          const invoiceIds = invoices.map(invoice => invoice.id);
          
          await tx.invoiceItem.deleteMany({
            where: { invoiceId: { in: invoiceIds } }
          });
          
          // Delete invoices
          await tx.invoice.deleteMany({
            where: { userId }
          });
          
          // Delete customers
          await tx.customer.deleteMany({
            where: { userId }
          });
          
          // Delete consents
          await tx.consent.deleteMany({
            where: { userId }
          });
          
          // Finally delete the user
          await tx.user.delete({
            where: { id: userId }
          });
        }
      });
      
      logger.info('Data deletion completed successfully', { userId, retainRequiredData });
      
      return true;
    } catch (error) {
      logger.error('Error deleting user data', { userId, error });
      throw new Error(`Failed to delete user data: ${error.message}`);
    }
  }
  
  /**
   * Records user consent for specific data processing activities
   * @param userId The ID of the user providing consent
   * @param type The type of consent being provided
   * @param status The consent status (granted, denied, withdrawn)
   * @param source Where the consent was collected (web, mobile, etc.)
   * @returns The created or updated consent record
   */
  async recordConsent(
    userId: string,
    type: ConsentType,
    status: ConsentStatus,
    source: string
  ) {
    try {
      logger.info('Recording user consent', { userId, type, status, source });
      
      // Check if consent record already exists
      const existingConsent = await prisma.consent.findFirst({
        where: {
          userId,
          type
        }
      });
      
      if (existingConsent) {
        // Update existing consent
        return await prisma.consent.update({
          where: { id: existingConsent.id },
          data: {
            status,
            updatedAt: new Date(),
            history: {
              create: {
                status,
                source,
                ipAddress: '',  // In a real implementation, this would be captured
                userAgent: ''   // In a real implementation, this would be captured
              }
            }
          }
        });
      } else {
        // Create new consent record
        return await prisma.consent.create({
          data: {
            userId,
            type,
            status,
            source,
            history: {
              create: {
                status,
                source,
                ipAddress: '',  // In a real implementation, this would be captured
                userAgent: ''   // In a real implementation, this would be captured
              }
            }
          }
        });
      }
    } catch (error) {
      logger.error('Error recording consent', { userId, type, status, error });
      throw new Error(`Failed to record consent: ${error.message}`);
    }
  }
  
  /**
   * Retrieves all consent records for a user
   * @param userId The ID of the user
   * @returns Array of consent records with history
   */
  async getUserConsents(userId: string) {
    try {
      return await prisma.consent.findMany({
        where: { userId },
        include: {
          history: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error retrieving user consents', { userId, error });
      throw new Error(`Failed to retrieve user consents: ${error.message}`);
    }
  }
  
  /**
   * Records data processing activities for compliance purposes
   * @param userId The ID of the user
   * @param activity The type of data processing activity
   * @param details Additional details about the activity
   */
  async recordDataProcessingActivity(
    userId: string,
    activity: string,
    details?: Record<string, any>
  ) {
    try {
      await prisma.dataProcessingRecord.create({
        data: {
          userId,
          activity,
          details: details ? JSON.stringify(details) : null
        }
      });
      
      logger.info('Recorded data processing activity', { userId, activity });
    } catch (error) {
      logger.error('Error recording data processing activity', { userId, activity, error });
      // Don't throw here to prevent disrupting the main application flow
    }
  }
  
  /**
   * Records data subject requests (access, deletion, etc.)
   * @param userId The ID of the user making the request
   * @param requestType The type of request
   * @param notes Additional notes about the request
   */
  private async recordDataRequest(
    userId: string,
    requestType: 'EXPORT' | 'DELETE' | 'RECTIFY',
    notes?: string
  ) {
    try {
      await prisma.dataSubjectRequest.create({
        data: {
          userId,
          requestType,
          status: 'PROCESSING',
          notes
        }
      });
      
      logger.info('Recorded data subject request', { userId, requestType });
    } catch (error) {
      logger.error('Error recording data subject request', { userId, requestType, error });
      // Don't throw here to prevent disrupting the main application flow
    }
  }
  
  /**
   * Updates the status of a data subject request
   * @param requestId The ID of the request
   * @param status The new status
   * @param notes Additional notes about the status update
   */
  async updateDataRequestStatus(
    requestId: string,
    status: 'PROCESSING' | 'COMPLETED' | 'DENIED',
    notes?: string
  ) {
    try {
      await prisma.dataSubjectRequest.update({
        where: { id: requestId },
        data: {
          status,
          completedAt: status === 'COMPLETED' ? new Date() : undefined,
          notes
        }
      });
      
      logger.info('Updated data request status', { requestId, status });
    } catch (error) {
      logger.error('Error updating data request status', { requestId, status, error });
      throw new Error(`Failed to update request status: ${error.message}`);
    }
  }
  
  /**
   * Masks sensitive data for security
   * @param data The data to mask
   * @returns Masked data
   */
  private maskSensitiveData(data: any): any {
    // Deep clone to avoid modifying the original
    const clonedData = JSON.parse(JSON.stringify(data));
    
    // Implement masking logic here based on data types
    // This is a simplified example
    
    return clonedData;
  }
  
  /**
   * Generates a data processing impact assessment
   * @param processName The name of the process being assessed
   * @param dataCategories Categories of data involved
   * @param processingPurpose Purpose of processing
   * @param risks Identified risks
   * @param mitigations Risk mitigations
   * @returns The created impact assessment
   */
  async createDataProcessingImpactAssessment(
    processName: string,
    dataCategories: string[],
    processingPurpose: string,
    risks: { description: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' }[],
    mitigations: { riskId: number; description: string }[]
  ) {
    try {
      return await prisma.dataProcessingImpactAssessment.create({
        data: {
          processName,
          dataCategories,
          processingPurpose,
          risks: JSON.stringify(risks),
          mitigations: JSON.stringify(mitigations),
          approved: false
        }
      });
    } catch (error) {
      logger.error('Error creating impact assessment', { processName, error });
      throw new Error(`Failed to create impact assessment: ${error.message}`);
    }
  }
}

// Export singleton instance
export const complianceService = new ComplianceService();
