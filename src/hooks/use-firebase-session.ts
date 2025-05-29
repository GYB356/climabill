"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { User } from 'firebase/auth';

/**
 * Custom hook to provide a session-like interface similar to NextAuth's useSession
 * This makes it easier to migrate from NextAuth to Firebase Auth
 */
export function useFirebaseSession() {
  const { user, loading, error } = useAuth();
  const [sessionData, setSessionData] = useState<{
    data: {
      user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string;
      } | null;
    } | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
  }>({
    data: null,
    status: 'loading',
  });

  useEffect(() => {
    if (loading) {
      setSessionData({
        data: null,
        status: 'loading',
      });
      return;
    }

    if (user) {
      setSessionData({
        data: {
          user: {
            id: user.uid,
            name: user.displayName,
            email: user.email,
            image: user.photoURL,
            // You might need to fetch custom claims from your backend
            role: (user as any).role || 'user',
          },
        },
        status: 'authenticated',
      });
    } else {
      setSessionData({
        data: null,
        status: 'unauthenticated',
      });
    }
  }, [user, loading]);

  return sessionData;
}

/**
 * Replacement for NextAuth's signIn function
 */
export function useFirebaseSignIn() {
  const { login, loginWithGoogle, loginWithGithub } = useAuth();

  const signIn = async (provider: string, options?: any) => {
    switch (provider) {
      case 'google':
        return loginWithGoogle();
      case 'github':
        return loginWithGithub();
      case 'credentials':
        if (options?.email && options?.password) {
          return login(options.email, options.password);
        }
        throw new Error('Email and password are required for credentials sign in');
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  };

  return signIn;
}

/**
 * Replacement for NextAuth's signOut function
 */
export function useFirebaseSignOut() {
  const { logout } = useAuth();
  return logout;
}
