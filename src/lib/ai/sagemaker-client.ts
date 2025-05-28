import { SAGEMAKER_CONFIG, MODEL_ENDPOINTS, CONFIDENCE_THRESHOLD } from './config';
import AWS from 'aws-sdk';

/**
 * Client for interacting with AWS SageMaker endpoints
 */
export class SageMakerClient {
  private sagemakerRuntime: AWS.SageMakerRuntime;

  constructor() {
    // Configure AWS SDK
    AWS.config.update({
      region: SAGEMAKER_CONFIG.region,
      accessKeyId: SAGEMAKER_CONFIG.accessKeyId,
      secretAccessKey: SAGEMAKER_CONFIG.secretAccessKey,
    });

    // Initialize SageMaker Runtime
    this.sagemakerRuntime = new AWS.SageMakerRuntime();
  }

  /**
   * Invoke a SageMaker endpoint for prediction
   * @param endpointName Name of the SageMaker endpoint
   * @param payload Input data for the model
   * @returns Prediction result
   */
  private async invokeEndpoint(
    endpointName: string,
    payload: any
  ): Promise<any> {
    try {
      const params = {
        EndpointName: endpointName,
        ContentType: 'application/json',
        Body: JSON.stringify(payload),
      };

      const response = await this.sagemakerRuntime.invokeEndpoint(params).promise();
      
      if (response.Body) {
        return JSON.parse(response.Body.toString());
      }
      
      throw new Error('Empty response from SageMaker endpoint');
    } catch (error) {
      console.error(`Error invoking SageMaker endpoint ${endpointName}:`, error);
      throw error;
    }
  }

  /**
   * Predict customer churn probability
   * @param customerData Customer data for prediction
   * @returns Churn prediction with probability
   */
  async predictChurn(customerData: any): Promise<{
    willChurn: boolean;
    probability: number;
    confidence: 'high' | 'medium' | 'low';
  }> {
    try {
      const result = await this.invokeEndpoint(
        MODEL_ENDPOINTS.CHURN_PREDICTION,
        customerData
      );
      
      const probability = result.probability || 0;
      const willChurn = probability > 0.5;
      
      // Determine confidence level
      let confidence: 'high' | 'medium' | 'low';
      if (probability > 0.8 || probability < 0.2) {
        confidence = 'high';
      } else if (probability > 0.65 || probability < 0.35) {
        confidence = 'medium';
      } else {
        confidence = 'low';
      }
      
      return {
        willChurn,
        probability,
        confidence,
      };
    } catch (error) {
      console.error('Error predicting churn:', error);
      throw error;
    }
  }

  /**
   * Predict customer lifetime value
   * @param customerData Customer data for prediction
   * @returns Predicted CLV value
   */
  async predictCustomerLifetimeValue(customerData: any): Promise<{
    predictedClv: number;
    confidence: 'high' | 'medium' | 'low';
  }> {
    try {
      const result = await this.invokeEndpoint(
        MODEL_ENDPOINTS.REVENUE_PREDICTION,
        customerData
      );
      
      const predictedClv = result.predicted_clv || 0;
      const confidenceScore = result.confidence_score || 0.5;
      
      // Determine confidence level
      let confidence: 'high' | 'medium' | 'low';
      if (confidenceScore > 0.8) {
        confidence = 'high';
      } else if (confidenceScore > 0.6) {
        confidence = 'medium';
      } else {
        confidence = 'low';
      }
      
      return {
        predictedClv,
        confidence,
      };
    } catch (error) {
      console.error('Error predicting CLV:', error);
      throw error;
    }
  }

  /**
   * Segment customers based on behavior and attributes
   * @param customerData Customer data for segmentation
   * @returns Customer segment and key attributes
   */
  async segmentCustomer(customerData: any): Promise<{
    segment: string;
    keyAttributes: Record<string, number>;
  }> {
    try {
      const result = await this.invokeEndpoint(
        MODEL_ENDPOINTS.CUSTOMER_SEGMENTATION,
        customerData
      );
      
      return {
        segment: result.segment || 'unknown',
        keyAttributes: result.key_attributes || {},
      };
    } catch (error) {
      console.error('Error segmenting customer:', error);
      throw error;
    }
  }

  /**
   * Get feature importance for a prediction
   * @param modelEndpoint Model endpoint name
   * @param customerData Customer data for prediction
   * @returns Feature importance scores
   */
  async getFeatureImportance(
    modelEndpoint: string,
    customerData: any
  ): Promise<Record<string, number>> {
    try {
      // Add explanation flag to the payload
      const payload = {
        ...customerData,
        explain: true,
      };
      
      const result = await this.invokeEndpoint(
        modelEndpoint,
        payload
      );
      
      return result.feature_importance || {};
    } catch (error) {
      console.error('Error getting feature importance:', error);
      throw error;
    }
  }
}
