/**
 * Rate Limiter for Authentication Operations
 * 
 * This module provides rate limiting functionality to prevent abuse of authentication endpoints.
 * It uses a simple in-memory store for development and can be configured to use Redis in production.
 */

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW = 3600 * 1000; // 1 hour in milliseconds
const MAX_PASSWORD_RESET_ATTEMPTS = 3;
const MAX_LOGIN_ATTEMPTS = 5;
const MAX_VERIFICATION_ATTEMPTS = 5;

/**
 * Check if an operation is rate limited
 * @param key Unique identifier for the rate limit (e.g., email or IP)
 * @param operation Type of operation being rate limited
 * @returns Boolean indicating if the operation is allowed or rate limited
 */
export function isRateLimited(key: string, operation: 'passwordReset' | 'login' | 'verification'): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  // If no entry exists, this is the first attempt
  if (!entry) {
    rateLimitStore.set(key, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now
    });
    return false;
  }
  
  // Check if the rate limit window has expired
  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
    // Reset the entry if the window has expired
    rateLimitStore.set(key, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now
    });
    return false;
  }
  
  // Increment the counter
  entry.count += 1;
  entry.lastAttempt = now;
  rateLimitStore.set(key, entry);
  
  // Check if the operation is rate limited
  const maxAttempts = getMaxAttemptsForOperation(operation);
  return entry.count > maxAttempts;
}

/**
 * Get the maximum number of attempts allowed for an operation
 */
function getMaxAttemptsForOperation(operation: 'passwordReset' | 'login' | 'verification'): number {
  switch (operation) {
    case 'passwordReset':
      return MAX_PASSWORD_RESET_ATTEMPTS;
    case 'login':
      return MAX_LOGIN_ATTEMPTS;
    case 'verification':
      return MAX_VERIFICATION_ATTEMPTS;
    default:
      return MAX_LOGIN_ATTEMPTS;
  }
}

/**
 * Reset rate limit for a key
 * @param key Unique identifier to reset
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Get remaining attempts for a key and operation
 * @param key Unique identifier
 * @param operation Type of operation
 * @returns Number of attempts remaining
 */
export function getRemainingAttempts(key: string, operation: 'passwordReset' | 'login' | 'verification'): number {
  const entry = rateLimitStore.get(key);
  if (!entry) {
    return getMaxAttemptsForOperation(operation);
  }
  
  // Check if the rate limit window has expired
  const now = Date.now();
  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
    return getMaxAttemptsForOperation(operation);
  }
  
  const maxAttempts = getMaxAttemptsForOperation(operation);
  return Math.max(0, maxAttempts - entry.count);
}

/**
 * Get time remaining in rate limit window
 * @param key Unique identifier
 * @returns Time remaining in milliseconds, or 0 if not rate limited
 */
export function getTimeRemaining(key: string): number {
  const entry = rateLimitStore.get(key);
  if (!entry) {
    return 0;
  }
  
  const now = Date.now();
  const timeElapsed = now - entry.firstAttempt;
  
  if (timeElapsed >= RATE_LIMIT_WINDOW) {
    return 0;
  }
  
  return RATE_LIMIT_WINDOW - timeElapsed;
}
