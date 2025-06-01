/**
 * Authentication configuration and utilities
 * 
 * This file provides compatibility with existing code that imports from @/lib/auth
 * It re-exports the Firebase auth configuration and utilities.
 */

// Re-export the main auth configuration
export { authOptions } from './auth/auth-config';

// Re-export auth utilities
export { hasRole, getAuthAdmin, getFirestoreAdmin } from './auth/auth-config';

// Re-export Firebase auth helpers
export { getServerUser } from './firebase/get-server-user';
export { withAuth, withAuthRole } from './firebase/api-auth';

// For backward compatibility with NextAuth imports
export { getServerSession } from './firebase/next-auth-compat';
