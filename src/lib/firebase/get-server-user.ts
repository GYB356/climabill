"use server";

import { cookies } from 'next/headers';
import { getFirebaseAdmin } from './admin';
import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Get the current user from Firebase Auth in server components and API routes
 * This is a replacement for getServerSession from NextAuth
 * 
 * @returns The decoded Firebase ID token or null if not authenticated
 */
export async function getServerUser(): Promise<DecodedIdToken | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('firebase-session');
  
  if (!sessionCookie?.value) {
    return null;
  }
  
  try {
    const { auth } = await getFirebaseAdmin();
    const decodedToken = await auth.verifySessionCookie(sessionCookie.value, true);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}

/**
 * Get the current user with role check
 * 
 * @param requiredRole The role required to access the resource
 * @returns The decoded Firebase ID token or null if not authenticated or not authorized
 */
export async function getAuthorizedUser(requiredRole?: string): Promise<DecodedIdToken | null> {
  const user = await getServerUser();
  
  if (!user) {
    return null;
  }
  
  // If no role is required, return the user
  if (!requiredRole) {
    return user;
  }
  
  // Check if the user has the required role
  const userRole = user.role || user.claims?.role;
  if (userRole !== requiredRole) {
    return null;
  }
  
  return user;
}
