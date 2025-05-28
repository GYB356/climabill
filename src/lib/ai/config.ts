/**
 * AI services configuration
 */

// AWS SageMaker configuration
export const SAGEMAKER_CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
  endpointName: process.env.SAGEMAKER_ENDPOINT_NAME,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

// Model endpoints for different prediction types
export const MODEL_ENDPOINTS = {
  CHURN_PREDICTION: process.env.CHURN_MODEL_ENDPOINT || 'churn-prediction',
  REVENUE_PREDICTION: process.env.REVENUE_MODEL_ENDPOINT || 'revenue-prediction',
  CUSTOMER_SEGMENTATION: process.env.SEGMENTATION_MODEL_ENDPOINT || 'customer-segmentation',
};

// Feature importance thresholds for model explanations
export const FEATURE_IMPORTANCE_THRESHOLD = 0.05;

// Confidence threshold for predictions (0-1)
export const CONFIDENCE_THRESHOLD = 0.7;

// Data warehouse connection settings
export const DATA_WAREHOUSE_CONFIG = {
  host: process.env.DW_HOST,
  database: process.env.DW_DATABASE,
  user: process.env.DW_USER,
  password: process.env.DW_PASSWORD,
  port: parseInt(process.env.DW_PORT || '5432'),
};

// Analytics data refresh intervals (in milliseconds)
export const ANALYTICS_REFRESH_INTERVALS = {
  REAL_TIME: 30000, // 30 seconds
  HOURLY: 3600000, // 1 hour
  DAILY: 86400000, // 24 hours
};
