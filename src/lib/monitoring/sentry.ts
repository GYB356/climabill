import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry for error tracking
 * This should be called in the application's entry point
 */
export function initSentry(): void {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ['localhost', 'app.climabill.com', 'api.climabill.com'],
        }),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Performance monitoring
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
}

/**
 * Capture an exception with Sentry
 * @param error Error to capture
 * @param context Additional context for the error
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  Sentry.captureException(error, { extra: context });
}

/**
 * Set user information for Sentry
 * @param user User information
 */
export function setUser(user: { id: string; email?: string; username?: string }): void {
  Sentry.setUser(user);
}

/**
 * Clear user information from Sentry
 */
export function clearUser(): void {
  Sentry.setUser(null);
}

/**
 * Set a tag for Sentry events
 * @param key Tag key
 * @param value Tag value
 */
export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

/**
 * Start a new transaction for performance monitoring
 * @param name Transaction name
 * @param op Operation type
 * @returns Sentry Transaction
 */
export function startTransaction(name: string, op: string): any {
  return Sentry.startTransaction({ name, op });
}

/**
 * Wrap a function with Sentry error tracking
 * @param fn Function to wrap
 * @param errorMessage Custom error message
 * @returns Wrapped function
 */
export function withErrorTracking<T extends (...args: any[]) => any>(
  fn: T,
  errorMessage?: string
): (...args: Parameters<T>) => ReturnType<T> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(
        error,
        {
          function: fn.name,
          arguments: args,
          customMessage: errorMessage,
        }
      );
      throw error;
    }
  };
}
