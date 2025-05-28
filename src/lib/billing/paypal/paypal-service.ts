import { PAYPAL_CONFIG, PAYPAL_WEBHOOK_ID } from './config';

/**
 * Service for handling PayPal-related operations
 */
export class PayPalService {
  private static async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${PAYPAL_CONFIG.clientId}:${PAYPAL_CONFIG.clientSecret}`
    ).toString('base64');

    const response = await fetch(
      `https://api${PAYPAL_CONFIG.environment === 'sandbox' ? '.sandbox' : ''}.paypal.com/v1/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${auth}`,
        },
        body: 'grant_type=client_credentials',
      }
    );

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Create a subscription for a customer
   * @param planId PayPal plan ID
   * @param customerId Customer ID in your system
   * @returns Subscription details
   */
  static async createSubscription(
    planId: string,
    customerId: string
  ): Promise<any> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `https://api${PAYPAL_CONFIG.environment === 'sandbox' ? '.sandbox' : ''}.paypal.com/v1/billing/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          plan_id: planId,
          custom_id: customerId,
          application_context: {
            brand_name: 'ClimaBill',
            locale: 'en-US',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'SUBSCRIBE_NOW',
            payment_method: {
              payer_selected: 'PAYPAL',
              payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
            },
          },
        }),
      }
    );

    return response.json();
  }

  /**
   * Get subscription details
   * @param subscriptionId PayPal subscription ID
   * @returns Subscription details
   */
  static async getSubscription(subscriptionId: string): Promise<any> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `https://api${PAYPAL_CONFIG.environment === 'sandbox' ? '.sandbox' : ''}.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.json();
  }

  /**
   * Cancel a subscription
   * @param subscriptionId PayPal subscription ID
   * @param reason Reason for cancellation
   * @returns Response status
   */
  static async cancelSubscription(
    subscriptionId: string,
    reason: string
  ): Promise<boolean> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `https://api${PAYPAL_CONFIG.environment === 'sandbox' ? '.sandbox' : ''}.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          reason,
        }),
      }
    );

    return response.status === 204;
  }

  /**
   * Suspend a subscription (pause billing)
   * @param subscriptionId PayPal subscription ID
   * @param reason Reason for suspension
   * @returns Response status
   */
  static async suspendSubscription(
    subscriptionId: string,
    reason: string
  ): Promise<boolean> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `https://api${PAYPAL_CONFIG.environment === 'sandbox' ? '.sandbox' : ''}.paypal.com/v1/billing/subscriptions/${subscriptionId}/suspend`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          reason,
        }),
      }
    );

    return response.status === 204;
  }

  /**
   * Activate a suspended subscription
   * @param subscriptionId PayPal subscription ID
   * @param reason Reason for activation
   * @returns Response status
   */
  static async activateSubscription(
    subscriptionId: string,
    reason: string
  ): Promise<boolean> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `https://api${PAYPAL_CONFIG.environment === 'sandbox' ? '.sandbox' : ''}.paypal.com/v1/billing/subscriptions/${subscriptionId}/activate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          reason,
        }),
      }
    );

    return response.status === 204;
  }

  /**
   * Update subscription quantity or plan
   * @param subscriptionId PayPal subscription ID
   * @param newPlanId New plan ID (optional)
   * @param quantity New quantity (optional)
   * @returns Updated subscription
   */
  static async updateSubscription(
    subscriptionId: string,
    newPlanId?: string,
    quantity?: number
  ): Promise<any> {
    const accessToken = await this.getAccessToken();

    // Build the update patches
    const patches = [];
    
    if (newPlanId) {
      patches.push({
        op: 'replace',
        path: '/plan',
        value: {
          id: newPlanId,
        },
      });
    }
    
    if (quantity) {
      patches.push({
        op: 'replace',
        path: '/quantity',
        value: quantity.toString(),
      });
    }

    const response = await fetch(
      `https://api${PAYPAL_CONFIG.environment === 'sandbox' ? '.sandbox' : ''}.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(patches),
      }
    );

    return response.status === 204;
  }

  /**
   * Verify a PayPal webhook signature
   * @param headers Request headers
   * @param body Request body
   * @returns Whether the signature is valid
   */
  static async verifyWebhookSignature(
    headers: Record<string, string>,
    body: string
  ): Promise<boolean> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `https://api${PAYPAL_CONFIG.environment === 'sandbox' ? '.sandbox' : ''}.paypal.com/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          webhook_id: PAYPAL_WEBHOOK_ID,
          webhook_event: JSON.parse(body),
          cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_time: headers['paypal-transmission-time'],
          transmission_sig: headers['paypal-transmission-sig'],
          auth_algo: headers['paypal-auth-algo'],
        }),
      }
    );

    const data = await response.json();
    return data.verification_status === 'SUCCESS';
  }
}
