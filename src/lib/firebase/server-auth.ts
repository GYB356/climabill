"use server";

import { cookies } from 'next/headers';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getFirebaseAdmin } from './admin';

/**
 * Get the current user from Firebase Auth in server components and API routes
 * This is a replacement for getServerSession from NextAuth
 */
export async function getServerUser(): Promise<DecodedIdToken | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('firebase-session');
  
  if (!sessionCookie?.value) {
    return null;
  }
  
  try {
    const { auth } = getFirebaseAdmin();
    const decodedToken = await auth.verifySessionCookie(sessionCookie.value, true);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}

/**
 * Verify Firebase ID token for API routes
 * This can be used as an alternative to session cookies
 */
export async function verifyIdToken(idToken: string): Promise<DecodedIdToken | null> {
  try {
    const { auth } = getFirebaseAdmin();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return null;
  }
}
