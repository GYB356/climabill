"use client";

/**
 * This file provides compatibility functions to make it easier to transition
 * from NextAuth to Firebase Auth. It re-exports functions with the same names
 * as NextAuth but using Firebase Auth under the hood.
 */

import { useAuth } from './auth-context';
import { getServerUser } from './get-server-user';

// Client-side authentication hooks that mimic NextAuth's API
export function useSession() {
  const { user, loading } = useAuth();
  
  return {
    data: user ? { user } : null,
    status: loading ? "loading" : user ? "authenticated" : "unauthenticated",
    update: () => {}
  };
}

export function signIn(provider?: string, options?: any) {
  const { login, loginWithGoogle, loginWithGithub } = useAuth();
  
  if (provider === "google") {
    return loginWithGoogle();
  } else if (provider === "github") {
    return loginWithGithub();
  } else {
    // Default to credentials
    const { email, password } = options?.credentials || {};
    return login(email, password);
  }
}

export function signOut() {
  const { logout } = useAuth();
  return logout();
}

// Server-side authentication compatibility
export async function getServerSession() {
  console.warn('getServerSession from next-auth is deprecated. Use getServerUser from @/lib/firebase/get-server-user instead.');
  const user = await getServerUser();
  
  // Return in a format similar to NextAuth session
  return user ? {
    user: {
      id: user.uid,
      name: user.name,
      email: user.email,
      image: user.picture,
      role: user.role || user.claims?.role
    }
  } : null;
}

// Export a fake NextAuth options object for backward compatibility
export const authOptions = {
  providers: [],
  session: {
    strategy: 'jwt',
  },
  callbacks: {},
};
