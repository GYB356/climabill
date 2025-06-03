import { useState, useCallback } from 'react';
import { useLoadingOperation } from '../ui/loading-context';
import { useAccessibility } from '../a11y/accessibility-context';
import { createServiceError, ErrorType, ServiceError } from '../carbon/error-handling';

/**
 * Custom hook that combines loading state, accessibility announcements, and error handling
 * for gamification-related operations.
 * 
 * @param operationKey - A unique key for the loading operation
 * @returns Object with loading state, error state, and withOperation function
 */
export function useGamificationOperation(operationKey: string) {
  // Get the loading operation from our loading context
  const { isLoading, withLoading } = useLoadingOperation(operationKey);
  
  // Get the announce function from our accessibility context
  const { announce } = useAccessibility();
  
  // Local error state
  const [error, setError] = useState<ServiceError | null>(null);
  
  /**
   * Execute an operation with loading state, error handling, and accessibility announcements
   * 
   * @param operation - The async operation to execute
   * @param successMessage - Message to announce on success (optional)
   * @param errorMessage - Base message for errors (optional)
   * @param onSuccess - Callback to execute on success (optional)
   * @param onError - Callback to execute on error (optional)
   * @returns The result of the operation if successful
   */
  const withOperation = useCallback(async <T,>(
    operation: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string,
    onSuccess?: (result: T) => void,
    onError?: (error: ServiceError) => void
  ): Promise<T | null> => {
    // Clear previous error
    setError(null);
    
    try {
      // Execute operation with loading state
      const result = await withLoading(operation);
      
      // Announce success if message provided
      if (successMessage) {
        announce(successMessage, false);
      }
      
      // Execute success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      // Convert to standard error format
      const serviceError = createServiceError(err, ErrorType.UNEXPECTED);
      
      // Set error state
      setError(serviceError);
      
      // Create error message
      const fullErrorMessage = errorMessage 
        ? `${errorMessage}: ${serviceError.message}`
        : serviceError.message;
      
      // Log error
      console.error(`Error in ${operationKey}:`, serviceError);
      
      // Announce error
      announce(fullErrorMessage, true);
      
      // Execute error callback if provided
      if (onError) {
        onError(serviceError);
      }
      
      return null;
    }
  }, [withLoading, announce, operationKey]);
  
  return {
    isLoading,
    error,
    setError,
    withOperation,
    clearError: () => setError(null)
  };
}
