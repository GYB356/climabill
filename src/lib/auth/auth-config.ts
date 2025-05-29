/**
 * Firebase Authentication Configuration
 * 
 * This file replaces the NextAuth configuration with Firebase Auth settings.
 * It provides compatibility functions and configuration for Firebase Auth.
 */

import { getFirebaseAdmin } from '../firebase/admin';

/**
 * Firebase Auth configuration options
 * This is a compatibility object for code that might still expect NextAuth's authOptions
 */
export const authOptions = {
  // This is a placeholder to maintain compatibility with code that expects NextAuth
  providers: [],
  session: {
    strategy: 'jwt',
  },
  callbacks: {},
};

/**
 * Verify if a user has a specific role
 * @param user Firebase user object with custom claims
 * @param requiredRole Role to check for
 * @returns Boolean indicating if user has the required role
 */
export function hasRole(user: any, requiredRole: string): boolean {
  if (!user) return false;
  
  // Check custom claims for role
  const userRole = user.role || user.claims?.role;
  return userRole === requiredRole;
}

/**
 * Get Firebase Admin instance
 * This is a helper function to get the Firebase Admin SDK instance
 * @returns Firebase Admin SDK instance
 */
export function getAuthAdmin() {
  return getFirebaseAdmin().auth;
}

/**
 * Get Firestore Admin instance
 * This is a helper function to get the Firestore Admin SDK instance
 * @returns Firestore Admin SDK instance
 */
export function getFirestoreAdmin() {
  return getFirebaseAdmin().firestore;
}
