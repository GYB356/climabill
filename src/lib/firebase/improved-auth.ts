import { AuthError } from 'firebase/auth';

/**
 * Enhanced error handler for Firebase authentication errors
 * Provides more detailed, user-friendly error messages with actionable solutions
 */
export const handleAuthError = (error: AuthError): string => {
  const errorCode = error.code;
  const errorMessage = error.message;
  
  // Log error for debugging
  console.error(`Firebase auth error [${errorCode}]:`, errorMessage);
  
  switch (errorCode) {
    // Email/Password Authentication Errors
    case 'auth/email-already-in-use':
      return 'This email is already in use. Please try another email or login with your existing account.';
    case 'auth/invalid-email':
      return 'Invalid email address format. Please enter a valid email address (e.g., user@example.com).';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support at support@climabill.com for assistance.';
    case 'auth/user-not-found':
      if (process.env.NODE_ENV === 'development') {
        return 'No account found with this email address. For development, try creating a new account or use test credentials: test@example.com / password123';
      }
      return 'No account found with this email address. Please check your email or create a new account.';
    case 'auth/wrong-password':
      if (process.env.NODE_ENV === 'development') {
        return 'Incorrect password. For development, try using: password123, admin123, test123, or demo123 depending on your test account.';
      }
      return 'Incorrect password. Please try again or use the "Forgot Password" option to reset it.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password with at least 8 characters, including numbers and special characters.';
    case 'auth/invalid-credential':
      return 'Invalid login credentials. Please check your email and password and try again.';
    case 'auth/missing-password':
      return 'Password is required. Please enter your password.';
    case 'auth/invalid-password':
      return 'Invalid password format. Password must be at least 6 characters long.';
      
    // Social Authentication Errors
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in method. Try signing in with Google or GitHub instead.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this website and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing the sign-in process. Please try again and complete the sign-in flow.';
    case 'auth/cancelled-popup-request':
      return 'The authentication request was cancelled. Please try again.';
    case 'auth/credential-already-in-use':
      return 'This credential is already associated with a different user account. Please use a different social account.';
      
    // Session & Authorization Errors
    case 'auth/requires-recent-login':
      return 'This operation requires recent authentication. Please log out and log in again before retrying this action.';
    case 'auth/multi-factor-auth-required':
      return 'Multi-factor authentication is required to complete this action. Please complete the MFA verification.';
    case 'auth/unauthorized-domain':
      return 'Authentication domain is not authorized. Please ensure you are accessing the application from a valid domain.';
    case 'auth/user-token-expired':
      return 'Your login session has expired. Please log in again to continue.';
      
    // Network & Technical Errors
    case 'auth/network-request-failed':
      return 'Network error occurred. Please check your internet connection and try again. If the problem persists, try again later.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful login attempts. Your account has been temporarily locked for security reasons. Please try again in a few minutes or reset your password.';
    case 'auth/web-storage-unsupported':
      return 'Web storage is not supported or is disabled in your browser. Please enable cookies and local storage in your browser settings.';
    case 'auth/internal-error':
      return 'An internal authentication error occurred. Please try again later or contact support if the problem persists.';
    case 'auth/timeout':
      return 'Authentication request timed out. Please check your internet connection and try again.';
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'Authentication service is temporarily unavailable. The system is now running in offline mode for development.';
      
    // Operation Errors
    case 'auth/operation-not-allowed':
      return 'This authentication operation is not allowed. Please contact support for assistance.';
    case 'auth/operation-not-supported-in-this-environment':
      return 'This authentication operation is not supported in your current environment. Please try using a different browser or device.';
      
    // Custom handling for unknown errors
    default:
      // Try to extract meaningful information from the error message
      if (errorMessage.includes('password')) {
        return 'There was an issue with your password. Please ensure it meets all requirements and try again.';
      } else if (errorMessage.includes('email')) {
        return 'There was an issue with your email address. Please check that it is correct and try again.';
      } else if (errorMessage.includes('network')) {
        return 'A network error occurred. Please check your internet connection and try again.';
      } else {
        return `Authentication error: ${error.message}. Please try again or contact support if the issue persists.`;
      }
  }
};

/**
 * Helper function to safely save callback URLs in multiple storage locations
 * for maximum compatibility with different authentication flows
 */
export const saveCallbackUrl = (callbackUrl: string | null): void => {
  if (!callbackUrl || callbackUrl === '/dashboard') {
    return;
  }
  
  try {
    // Store in multiple locations for compatibility
    sessionStorage.setItem('redirectAfterLogin', callbackUrl);
    localStorage.setItem('auth_redirect', callbackUrl);
    console.log(`Saved callback URL: ${callbackUrl}`);
  } catch (error) {
    console.error('Error saving callback URL:', error);
  }
};

/**
 * Helper function to get the current callback URL from various storage mechanisms
 */
export const getCallbackUrl = (): string => {
  try {
    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const urlCallbackParam = urlParams.get('callbackUrl');
    
    // Then check various storage mechanisms
    const storedCallbackUrl = sessionStorage.getItem('redirectAfterLogin');
    const legacyCallbackUrl = sessionStorage.getItem('auth_callback_url');
    const localStorageCallback = localStorage.getItem('auth_redirect');
    
    // Use the first available callback URL or default to dashboard
    return urlCallbackParam || 
           storedCallbackUrl || 
           legacyCallbackUrl || 
           localStorageCallback || 
           '/dashboard';
  } catch (error) {
    console.error('Error retrieving callback URL:', error);
    return '/dashboard';
  }
};

/**
 * Helper function to clear all stored callback URLs
 */
export const clearStoredCallbackUrls = (): void => {
  try {
    sessionStorage.removeItem('redirectAfterLogin');
    sessionStorage.removeItem('auth_callback_url');
    localStorage.removeItem('auth_redirect');
  } catch (error) {
    console.error('Error clearing stored callback URLs:', error);
  }
};
