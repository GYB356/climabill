import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import crypto from 'crypto';
import { OAUTH_CONFIG, OAuthProvider } from '@/lib/integrations/oauth/config';
import { NotificationService, NotificationTemplate } from '@/lib/integrations/notifications/notification-service';

/**
 * Verify QuickBooks webhook signature
 * @param payload Webhook payload
 * @param signature Signature from headers
 * @returns Whether the signature is valid
 */
function verifyQuickBooksSignature(payload: string, signature: string): boolean {
  try {
    const secret = OAUTH_CONFIG[OAuthProvider.QUICKBOOKS].webhookSecret;
    if (!secret) return false;
    
    const hmac = crypto.createHmac('sha256', secret);
    const computedSignature = hmac.update(payload).digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(signature)
    );
  } catch (error) {
    console.error('Error verifying QuickBooks webhook signature:', error);
    return false;
  }
}

/**
 * Verify Xero webhook signature
 * @param payload Webhook payload
 * @param signature Signature from headers
 * @returns Whether the signature is valid
 */
function verifyXeroSignature(payload: string, signature: string): boolean {
  try {
    const secret = OAUTH_CONFIG[OAuthProvider.XERO].webhookSecret;
    if (!secret) return false;
    
    const hmac = crypto.createHmac('sha256', secret);
    const computedSignature = hmac.update(payload).digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(signature)
    );
  } catch (error) {
    console.error('Error verifying Xero webhook signature:', error);
    return false;
  }
}

/**
 * Process QuickBooks webhook event
 * @param event Webhook event
 * @returns Processing result
 */
async function processQuickBooksEvent(event: any): Promise<{ success: boolean; message: string }> {
  try {
    // Log the event
    await firestore.collection('webhooks').add({
      provider: OAuthProvider.QUICKBOOKS,
      event,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    
    // Get the entity and operation
    const { entities, eventNotifications } = event;
    if (!entities || !eventNotifications || eventNotifications.length === 0) {
      return { success: false, message: 'Invalid event format' };
    }
    
    const notification = eventNotifications[0];
    const { operation, entityName } = notification;
    
    // Find the integration that this event belongs to
    const realmId = event.realmId;
    if (!realmId) {
      return { success: false, message: 'Missing realmId' };
    }
    
    // Find the user that owns this integration
    const integrationsSnapshot = await firestore
      .collectionGroup('integrations')
      .where('provider', '==', OAuthProvider.QUICKBOOKS)
      .where('providerTenantId', '==', realmId)
      .get();
    
    if (integrationsSnapshot.empty) {
      return { success: false, message: 'Integration not found' };
    }
    
    // Process each integration (there should typically be only one)
    for (const doc of integrationsSnapshot.docs) {
      const userId = doc.ref.path.split('/')[1]; // Extract user ID from path
      
      // Send notification based on event type
      const notificationService = new NotificationService();
      
      if (entityName === 'Invoice' && operation === 'Create') {
        // New invoice created in QuickBooks
        for (const entity of entities) {
          const notification = notificationService.createNotificationFromTemplate(
            NotificationTemplate.INVOICE_CREATED,
            {
              source: 'QuickBooks',
              invoiceId: entity.id,
              invoiceNumber: entity.number || 'Unknown',
              customerName: entity.customerName || 'Unknown',
              amount: entity.amount || 0,
              currency: entity.currencyCode || '$',
              date: entity.date || new Date().toISOString(),
            }
          );
          
          await notificationService.sendNotification(userId, notification);
        }
      } else if (entityName === 'Invoice' && operation === 'Update') {
        // Invoice updated in QuickBooks
        for (const entity of entities) {
          if (entity.status === 'Paid') {
            const notification = notificationService.createNotificationFromTemplate(
              NotificationTemplate.INVOICE_PAID,
              {
                source: 'QuickBooks',
                invoiceId: entity.id,
                invoiceNumber: entity.number || 'Unknown',
                customerName: entity.customerName || 'Unknown',
                amount: entity.amount || 0,
                currency: entity.currencyCode || '$',
                date: entity.date || new Date().toISOString(),
              }
            );
            
            await notificationService.sendNotification(userId, notification);
          }
        }
      } else if (entityName === 'Payment' && operation === 'Create') {
        // Payment created in QuickBooks
        for (const entity of entities) {
          const notification = notificationService.createNotificationFromTemplate(
            NotificationTemplate.PAYMENT_RECEIVED,
            {
              source: 'QuickBooks',
              paymentId: entity.id,
              customerName: entity.customerName || 'Unknown',
              amount: entity.amount || 0,
              currency: entity.currencyCode || '$',
              date: entity.date || new Date().toISOString(),
            }
          );
          
          await notificationService.sendNotification(userId, notification);
        }
      } else if (entityName === 'Customer' && operation === 'Create') {
        // Customer created in QuickBooks
        for (const entity of entities) {
          const notification = notificationService.createNotificationFromTemplate(
            NotificationTemplate.CUSTOMER_CREATED,
            {
              source: 'QuickBooks',
              customerId: entity.id,
              customerName: entity.displayName || 'Unknown',
              email: entity.primaryEmailAddr?.address || 'Unknown',
              phone: entity.primaryPhone?.freeFormNumber || 'Unknown',
            }
          );
          
          await notificationService.sendNotification(userId, notification);
        }
      }
    }
    
    return { success: true, message: 'Event processed successfully' };
  } catch (error) {
    console.error('Error processing QuickBooks webhook:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Process Xero webhook event
 * @param event Webhook event
 * @returns Processing result
 */
async function processXeroEvent(event: any): Promise<{ success: boolean; message: string }> {
  try {
    // Log the event
    await firestore.collection('webhooks').add({
      provider: OAuthProvider.XERO,
      event,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    
    // Get the event details
    const { events, tenantId } = event;
    if (!events || !tenantId) {
      return { success: false, message: 'Invalid event format' };
    }
    
    // Find the integration that this event belongs to
    const integrationsSnapshot = await firestore
      .collectionGroup('integrations')
      .where('provider', '==', OAuthProvider.XERO)
      .where('providerTenantId', '==', tenantId)
      .get();
    
    if (integrationsSnapshot.empty) {
      return { success: false, message: 'Integration not found' };
    }
    
    // Process each integration (there should typically be only one)
    for (const doc of integrationsSnapshot.docs) {
      const userId = doc.ref.path.split('/')[1]; // Extract user ID from path
      
      // Send notification based on event type
      const notificationService = new NotificationService();
      
      for (const event of events) {
        const { resourceId, resourceType, eventType, eventDateUtc } = event;
        
        if (resourceType === 'Invoices' && eventType === 'Create') {
          // New invoice created in Xero
          const notification = notificationService.createNotificationFromTemplate(
            NotificationTemplate.INVOICE_CREATED,
            {
              source: 'Xero',
              invoiceId: resourceId,
              invoiceNumber: 'Unknown', // Xero doesn't provide details in the webhook
              customerName: 'Unknown',
              amount: 0,
              currency: '$',
              date: eventDateUtc,
            }
          );
          
          await notificationService.sendNotification(userId, notification);
        } else if (resourceType === 'Invoices' && eventType === 'Update') {
          // Invoice updated in Xero
          const notification = notificationService.createNotificationFromTemplate(
            NotificationTemplate.INVOICE_PAID,
            {
              source: 'Xero',
              invoiceId: resourceId,
              invoiceNumber: 'Unknown', // Xero doesn't provide details in the webhook
              customerName: 'Unknown',
              amount: 0,
              currency: '$',
              date: eventDateUtc,
            }
          );
          
          await notificationService.sendNotification(userId, notification);
        } else if (resourceType === 'Payments' && eventType === 'Create') {
          // Payment created in Xero
          const notification = notificationService.createNotificationFromTemplate(
            NotificationTemplate.PAYMENT_RECEIVED,
            {
              source: 'Xero',
              paymentId: resourceId,
              customerName: 'Unknown', // Xero doesn't provide details in the webhook
              amount: 0,
              currency: '$',
              date: eventDateUtc,
            }
          );
          
          await notificationService.sendNotification(userId, notification);
        } else if (resourceType === 'Contacts' && eventType === 'Create') {
          // Contact created in Xero
          const notification = notificationService.createNotificationFromTemplate(
            NotificationTemplate.CUSTOMER_CREATED,
            {
              source: 'Xero',
              customerId: resourceId,
              customerName: 'Unknown', // Xero doesn't provide details in the webhook
              email: 'Unknown',
              phone: 'Unknown',
            }
          );
          
          await notificationService.sendNotification(userId, notification);
        }
      }
    }
    
    return { success: true, message: 'Event processed successfully' };
  } catch (error) {
    console.error('Error processing Xero webhook:', error);
    return { success: false, message: error.message };
  }
}

/**
 * POST handler for accounting webhooks
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the provider from the URL
    const url = new URL(request.url);
    const provider = url.searchParams.get('provider');
    
    // Get the request body
    const body = await request.text();
    let payload: any;
    
    try {
      payload = JSON.parse(body);
    } catch (error) {
      console.error('Error parsing webhook payload:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    
    // Process based on provider
    if (provider === 'quickbooks') {
      // Verify signature
      const signature = request.headers.get('intuit-signature');
      if (!signature || !verifyQuickBooksSignature(body, signature)) {
        return NextResponse.json(
          { success: false, message: 'Invalid signature' },
          { status: 401 }
        );
      }
      
      // Process the event
      const result = await processQuickBooksEvent(payload);
      
      return NextResponse.json(result, {
        status: result.success ? 200 : 400,
      });
    } else if (provider === 'xero') {
      // Verify signature
      const signature = request.headers.get('x-xero-signature');
      if (!signature || !verifyXeroSignature(body, signature)) {
        return NextResponse.json(
          { success: false, message: 'Invalid signature' },
          { status: 401 }
        );
      }
      
      // Process the event
      const result = await processXeroEvent(payload);
      
      return NextResponse.json(result, {
        status: result.success ? 200 : 400,
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Unsupported provider' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing accounting webhook:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
