/**
 * Firebase Authentication Admin utilities
 * 
 * This file provides server-side authentication utilities for API routes.
 */

import { NextRequest } from 'next/server';
import { getServerUser } from './get-server-user';
import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Get the current user from a NextRequest
 * This is used in API routes to get the authenticated user
 * 
 * @param request The NextRequest object
 * @returns The decoded Firebase ID token or null if not authenticated
 */
export async function getCurrentUser(request: NextRequest): Promise<DecodedIdToken | null> {
  // For now, we'll just use the session cookie approach
  // In the future, we could also check for Authorization header with Bearer token
  return await getServerUser();
}

/**
 * Get the current user with role verification
 * 
 * @param request The NextRequest object
 * @param requiredRole The role required to access the resource
 * @returns The decoded Firebase ID token or null if not authenticated or not authorized
 */
export async function getCurrentUserWithRole(request: NextRequest, requiredRole: string): Promise<DecodedIdToken | null> {
  const user = await getCurrentUser(request);
  
  if (!user) {
    return null;
  }
  
  // Check if the user has the required role
  const userRole = user.role || user.claims?.role;
  if (userRole !== requiredRole) {
    return null;
  }
  
  return user;
}
