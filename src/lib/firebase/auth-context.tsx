"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  User,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendEmailVerification,
  getIdToken
} from 'firebase/auth';
import { auth } from './config';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  loginWithGithub: () => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Alias for compatibility with existing code
export const useAuthContext = useAuth;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Session cookies removed - using client-side authentication only
  // This simplifies the auth flow and removes dependency on Firebase Admin SDK

  // Track pending redirects to prevent race conditions
  const pendingRedirectRef = React.useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      // Handle automatic redirect for authenticated users on auth pages
      if (user && !pendingRedirectRef.current) {
        const currentPath = window.location.pathname;
        const isAuthPage =
          currentPath === '/auth/signin' ||
          currentPath === '/login' ||
          currentPath === '/signup' ||
          currentPath === '/auth/signup';

        if (isAuthPage) {
          console.log('User authenticated on auth page, redirecting to dashboard');
          pendingRedirectRef.current = true;

          // Redirect to dashboard immediately
          setTimeout(() => {
            router.push('/dashboard');
            // Reset redirect flag after navigation
            setTimeout(() => {
              pendingRedirectRef.current = false;
            }, 500);
          }, 200);
        }
      }
    });

    return unsubscribe;
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Mark that a redirect is pending to prevent race conditions
      pendingRedirectRef.current = true;
      
      return result.user;
    } catch (error: any) {
      console.error('Firebase auth error:', error.code, error.message);
      let errorMessage = 'An error occurred during sign in';
      
      // Provide more user-friendly error messages
      switch(error.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      console.log('Attempting to create user with email:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Signup successful, user created:', { 
        uid: result.user.uid, 
        email: result.user.email,
        timestamp: new Date().toISOString()
      });
      
      // Mark that a redirect is pending to prevent race conditions
      pendingRedirectRef.current = true;
      
      return result.user;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Mark that a redirect is pending to prevent race conditions
      pendingRedirectRef.current = true;
      
      return result.user;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Updated loginWithGithub function without session cookie creation
  const loginWithGithub = async () => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Mark that a redirect is pending to prevent race conditions
      pendingRedirectRef.current = true;
      
      // Removed server-side session cookie creation as it's no longer needed
      // await createSessionCookie(result.user);
      
      return result.user;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Updated logout function without session cookie deletion
  const logout = async () => {
    try {
      await signOut(auth);
      
      // Removed session cookie clearing logic as we're not using server-side sessions
      // await fetch('/api/auth/session', {
      //   method: 'DELETE',
      // });
      
      router.push('/');
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      setLoading(true);
      if (!user || !user.email) {
        throw new Error('No user is currently logged in');
      }
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!user) {
        throw new Error('No user is currently logged in');
      }
      await sendEmailVerification(user);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    loginWithGoogle,
    loginWithGithub,
    logout,
    resetPassword,
    updateUserPassword,
    sendVerificationEmail,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
