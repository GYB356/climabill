/**
 * API configuration
 */

// Base URL for API requests
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.climabill.com/v1';

// Default request timeout in milliseconds
export const API_TIMEOUT = 30000;

// Maximum number of retries for failed requests
export const API_MAX_RETRIES = 3;

// Retry delay in milliseconds
export const API_RETRY_DELAY = 1000;
