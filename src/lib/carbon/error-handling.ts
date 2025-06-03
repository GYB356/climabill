/**
 * Standardized error handling for carbon tracking and gamification services
 */

// Define custom error types for service operations
export enum ErrorType {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // API errors
  API_UNAVAILABLE = 'API_UNAVAILABLE',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  
  // Data errors
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  
  // Client errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // General errors
  UNEXPECTED = 'UNEXPECTED'
}

// Interface for standardized error object
export interface ServiceError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  details?: any;
  originalError?: Error;
}

/**
 * Create a standard service error from various error types
 */
export function createServiceError(error: any, defaultType = ErrorType.UNEXPECTED): ServiceError {
  // Already a ServiceError, just return it
  if (error && error.type && Object.values(ErrorType).includes(error.type)) {
    return error as ServiceError;
  }
  
  // Handle network and HTTP errors
  if (error instanceof Error) {
    // Network errors
    if (error.name === 'NetworkError' || error.message.includes('network')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network connection error. Please check your internet connection.',
        originalError: error
      };
    }
    
    // Timeout errors
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT,
        message: 'Request timed out. Please try again later.',
        originalError: error
      };
    }
    
    // Default error handling
    return {
      type: defaultType,
      message: error.message || 'An unexpected error occurred',
      originalError: error
    };
  }
  
  // Handle HTTP response errors
  if (error && error.status) {
    switch (error.status) {
      case 400:
        return {
          type: ErrorType.VALIDATION_ERROR,
          message: error.message || 'Invalid request data',
          statusCode: 400,
          details: error.details || error.data,
          originalError: error
        };
      case 401:
        return {
          type: ErrorType.UNAUTHORIZED,
          message: 'You are not authenticated. Please sign in.',
          statusCode: 401,
          originalError: error
        };
      case 403:
        return {
          type: ErrorType.FORBIDDEN,
          message: 'You do not have permission to perform this action.',
          statusCode: 403,
          originalError: error
        };
      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          message: error.message || 'The requested resource was not found',
          statusCode: 404,
          originalError: error
        };
      case 409:
        return {
          type: ErrorType.CONFLICT,
          message: error.message || 'This operation conflicts with the current state',
          statusCode: 409,
          originalError: error
        };
      case 429:
        return {
          type: ErrorType.RATE_LIMIT,
          message: 'Rate limit exceeded. Please try again later.',
          statusCode: 429,
          originalError: error
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ErrorType.API_UNAVAILABLE,
          message: 'The service is temporarily unavailable. Please try again later.',
          statusCode: error.status,
          originalError: error
        };
      default:
        return {
          type: ErrorType.API_ERROR,
          message: error.message || 'An API error occurred',
          statusCode: error.status,
          details: error.data,
          originalError: error
        };
    }
  }
  
  // Default fallback for unknown error formats
  return {
    type: defaultType,
    message: error?.message || 'An unexpected error occurred',
    details: error,
    originalError: error instanceof Error ? error : new Error(JSON.stringify(error))
  };
}

/**
 * Log a service error with appropriate severity level
 */
export function logServiceError(error: ServiceError, context?: string): void {
  const contextPrefix = context ? `[${context}] ` : '';
  
  // Determine severity based on error type
  switch (error.type) {
    // Critical errors - use console.error
    case ErrorType.UNEXPECTED:
    case ErrorType.API_ERROR:
    case ErrorType.API_UNAVAILABLE:
      console.error(
        `${contextPrefix}Critical error: ${error.message}`,
        { type: error.type, details: error.details, originalError: error.originalError }
      );
      break;
      
    // Warning level errors - use console.warn
    case ErrorType.NETWORK_ERROR:
    case ErrorType.TIMEOUT:
    case ErrorType.UNAUTHORIZED:
    case ErrorType.FORBIDDEN:
      console.warn(
        `${contextPrefix}Warning: ${error.message}`,
        { type: error.type, statusCode: error.statusCode }
      );
      break;
      
    // Info level errors - use console.info
    case ErrorType.NOT_FOUND:
    case ErrorType.VALIDATION_ERROR:
    case ErrorType.CONFLICT:
    case ErrorType.RATE_LIMIT:
      console.info(
        `${contextPrefix}Info: ${error.message}`,
        { type: error.type, statusCode: error.statusCode }
      );
      break;
      
    default:
      console.log(
        `${contextPrefix}Error: ${error.message}`,
        { type: error.type }
      );
  }
}

/**
 * Safely handle service operations with standardized error handling
 * @param operation Function to execute
 * @param errorHandler Custom error handler (optional)
 * @param fallbackValue Fallback value to return on error (optional)
 */
export async function safeServiceOperation<T>(
  operation: () => Promise<T>,
  errorHandler?: (error: ServiceError) => void,
  fallbackValue?: T,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // Convert to standard error format
    const serviceError = createServiceError(error);
    
    // Log the error
    logServiceError(serviceError, context);
    
    // Call custom error handler if provided
    if (errorHandler) {
      errorHandler(serviceError);
    }
    
    // Return fallback value or re-throw
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    
    throw serviceError;
  }
}

/**
 * Get a user-friendly message for displaying to end users
 */
export function getUserFriendlyErrorMessage(error: ServiceError): string {
  switch (error.type) {
    case ErrorType.UNAUTHORIZED:
      return 'Please sign in to continue.';
    case ErrorType.FORBIDDEN:
      return 'You don\'t have permission to perform this action.';
    case ErrorType.NOT_FOUND:
      return 'The requested information could not be found.';
    case ErrorType.NETWORK_ERROR:
      return 'Unable to connect. Please check your internet connection.';
    case ErrorType.TIMEOUT:
      return 'The request timed out. Please try again.';
    case ErrorType.API_UNAVAILABLE:
      return 'This service is temporarily unavailable. Please try again later.';
    case ErrorType.RATE_LIMIT:
      return 'Too many requests. Please wait a moment and try again.';
    case ErrorType.VALIDATION_ERROR:
      return error.message || 'Please check your input and try again.';
    case ErrorType.CONFLICT:
      return error.message || 'This action conflicts with existing data.';
    default:
      return 'An unexpected error occurred. Please try again later.';
  }
}
