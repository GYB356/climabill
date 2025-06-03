"use client";

import React, { useEffect } from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ServiceError, ErrorType } from '../../lib/carbon/error-handling';
import { useAccessibility } from '../../lib/a11y/accessibility-context';

interface ErrorDisplayProps {
  error: ServiceError | null;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  autoAnnounce?: boolean;
}

/**
 * A reusable error display component that shows different styling based on error type
 * and supports accessibility features like screen reader announcements
 */
export default function ErrorDisplay({
  error,
  title,
  onRetry,
  onDismiss,
  className = '',
  autoAnnounce = true
}: ErrorDisplayProps) {
  const { announce } = useAccessibility();
  
  // No error means no display
  if (!error) return null;
  
  // Announce the error via screen reader when it appears
  useEffect(() => {
    if (autoAnnounce && error) {
      announce(`Error: ${error.message}`, true);
    }
  }, [error, autoAnnounce, announce]);
  
  // Determine the alert variant based on error type
  const getAlertVariant = () => {
    // Critical errors
    if ([
      ErrorType.API_ERROR,
      ErrorType.API_UNAVAILABLE,
      ErrorType.UNEXPECTED
    ].includes(error.type as ErrorType)) {
      return "destructive";
    }
    
    // Warning level errors
    if ([
      ErrorType.NETWORK_ERROR,
      ErrorType.TIMEOUT,
      ErrorType.UNAUTHORIZED,
      ErrorType.FORBIDDEN
    ].includes(error.type as ErrorType)) {
      return "warning";
    }
    
    // Info level errors
    return "default";
  };
  
  // Get the appropriate icon based on error type
  const getIcon = () => {
    // Critical errors
    if ([
      ErrorType.API_ERROR,
      ErrorType.API_UNAVAILABLE,
      ErrorType.UNEXPECTED
    ].includes(error.type as ErrorType)) {
      return <XCircle className="h-4 w-4" />;
    }
    
    // Warning level errors
    if ([
      ErrorType.NETWORK_ERROR,
      ErrorType.TIMEOUT,
      ErrorType.UNAUTHORIZED,
      ErrorType.FORBIDDEN
    ].includes(error.type as ErrorType)) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    
    // Info level errors
    return <Info className="h-4 w-4" />;
  };
  
  // Get user-friendly error title if none provided
  const getErrorTitle = () => {
    if (title) return title;
    
    switch (error.type) {
      case ErrorType.API_ERROR:
        return 'System Error';
      case ErrorType.API_UNAVAILABLE:
        return 'Service Unavailable';
      case ErrorType.NETWORK_ERROR:
        return 'Network Error';
      case ErrorType.TIMEOUT:
        return 'Request Timeout';
      case ErrorType.UNAUTHORIZED:
        return 'Authentication Required';
      case ErrorType.FORBIDDEN:
        return 'Access Denied';
      case ErrorType.NOT_FOUND:
        return 'Not Found';
      case ErrorType.VALIDATION_ERROR:
        return 'Invalid Input';
      case ErrorType.CONFLICT:
        return 'Conflict Error';
      case ErrorType.RATE_LIMIT:
        return 'Too Many Requests';
      default:
        return 'Error';
    }
  };

  return (
    <Alert 
      variant={getAlertVariant()}
      className={`mb-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      {getIcon()}
      <AlertTitle>{getErrorTitle()}</AlertTitle>
      <AlertDescription>
        <p>{error.message}</p>
        
        {(error.details && typeof error.details === 'object') && (
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer">More details</summary>
            <pre className="mt-2 max-h-24 overflow-auto p-2 bg-background/50 rounded text-xs">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          </details>
        )}
        
        {(onRetry || onDismiss) && (
          <div className="mt-2 flex space-x-2">
            {onRetry && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onRetry}
                aria-label="Retry operation"
              >
                Retry
              </Button>
            )}
            
            {onDismiss && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onDismiss}
                aria-label="Dismiss error"
              >
                Dismiss
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
