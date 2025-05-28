import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

/**
 * Initialize Datadog RUM (Real User Monitoring) and Logs
 * This should be called in the application's entry point
 */
export function initDatadog(): void {
  if (process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID && process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN) {
    // Initialize RUM
    datadogRum.init({
      applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
      clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
      site: process.env.NEXT_PUBLIC_DATADOG_SITE || 'datadoghq.com',
      service: 'climabill-frontend',
      env: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
    });

    // Initialize Logs
    datadogLogs.init({
      clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
      site: process.env.NEXT_PUBLIC_DATADOG_SITE || 'datadoghq.com',
      service: 'climabill-frontend',
      env: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      forwardErrorsToLogs: true,
      sessionSampleRate: 100,
    });
  }
}

/**
 * Set user information for Datadog
 * @param user User information
 */
export function setUser(user: { id: string; email?: string; name?: string }): void {
  if (datadogRum.getInitConfiguration()) {
    datadogRum.setUser({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  }
}

/**
 * Add a custom action to Datadog RUM
 * @param name Action name
 * @param context Additional context
 */
export function addAction(name: string, context?: Record<string, any>): void {
  if (datadogRum.getInitConfiguration()) {
    datadogRum.addAction(name, context);
  }
}

/**
 * Add a custom error to Datadog RUM and Logs
 * @param error Error to add
 * @param context Additional context
 */
export function addError(error: Error, context?: Record<string, any>): void {
  if (datadogRum.getInitConfiguration()) {
    datadogRum.addError(error, context);
  }
  
  if (datadogLogs.getInitConfiguration()) {
    datadogLogs.logger.error(error.message, {
      error,
      ...context,
    });
  }
}

/**
 * Log a message to Datadog Logs
 * @param level Log level
 * @param message Log message
 * @param context Additional context
 */
export function log(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  context?: Record<string, any>
): void {
  if (datadogLogs.getInitConfiguration()) {
    datadogLogs.logger[level](message, context);
  }
}

/**
 * Start a timing measurement
 * @param name Measurement name
 * @returns Function to end the timing measurement
 */
export function startTiming(name: string): () => void {
  const startTime = performance.now();
  
  return () => {
    const duration = performance.now() - startTime;
    if (datadogRum.getInitConfiguration()) {
      datadogRum.addTiming(name, duration);
    }
  };
}
