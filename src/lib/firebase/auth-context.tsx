"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  getIdToken,
  AuthError
} from 'firebase/auth';
import { auth, isDevelopment } from './config';
import { handleAuthError } from './auth';
import { useRouter } from 'next/navigation';
import { offlineAuth } from './offline-auth';

// Flag to track if we're using offline auth mode
const useOfflineAuth = isDevelopment && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

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

  // Custom method to update user state that works with both Firebase and offline auth
  const updateUserState = (user: User | null) => {
    setUser(user);
    setLoading(false);
  };

  useEffect(() => {
    // Check for offline auth user on mount
    if (useOfflineAuth && offlineAuth.currentUser) {
      console.log('🔄 Found existing offline auth user:', offlineAuth.currentUser.email);
      updateUserState(offlineAuth.currentUser);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Only use Firebase auth state if we're not in offline mode
      if (!useOfflineAuth) {
        updateUserState(user);
      } else if (!user && !offlineAuth.currentUser) {
        // If no Firebase user and no offline user, set to null
        updateUserState(null);
      }

      // Handle automatic redirect for authenticated users on auth pages
      if (user && !pendingRedirectRef.current) {
        const currentPath = window.location.pathname;
        const isAuthPage =
          currentPath === '/auth/signin' ||
          currentPath === '/login' ||
          currentPath === '/signup' ||
          currentPath === '/auth/signup' ||
          currentPath === '/forgot-password' ||
          currentPath === '/reset-password';

        if (isAuthPage) {
          console.log('User authenticated on auth page, redirecting based on callback URL');
          pendingRedirectRef.current = true;

          try {
            // Get callback URL from multiple possible sources in order of priority
            // 1. URL parameters (highest priority)
            const urlParams = new URLSearchParams(window.location.search);
            const urlCallbackParam = urlParams.get('callbackUrl');
            
            // 2. Session storage - current standard key
            const storedCallbackUrl = sessionStorage.getItem('redirectAfterLogin');
            
            // 3. Session storage - legacy key
            const legacyCallbackUrl = sessionStorage.getItem('auth_callback_url');
            
            // 4. Local storage - fallback (some apps might use this)
            const localStorageCallback = localStorage.getItem('auth_redirect');
            
            // Use the first available callback URL or default to dashboard
            const callbackUrl = urlCallbackParam || 
                                storedCallbackUrl || 
                                legacyCallbackUrl || 
                                localStorageCallback || 
                                '/dashboard';
            
            // Clean up all stored redirects to prevent stale redirects
            sessionStorage.removeItem('redirectAfterLogin');
            sessionStorage.removeItem('auth_callback_url');
            localStorage.removeItem('auth_redirect');
            
            console.log(`Redirecting to: ${callbackUrl}`);
            
            // Use a short delay to allow the auth state to settle
            setTimeout(() => {
              router.push(callbackUrl);
              setTimeout(() => {
                pendingRedirectRef.current = false;
              }, 500);
            }, 200);
          } catch (error) {
            console.error('Error during redirect:', error);
            // If there's any error in the redirect process, go to dashboard as fallback
            router.push('/dashboard');
            pendingRedirectRef.current = false;
          }
        }
      }
    });

    return unsubscribe;
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      console.log('Attempting login with email:', email);
      
      let result;
      let user;
      
      // Check if we're in offline mode or if there are API key issues
      try {
        result = await signInWithEmailAndPassword(auth, email, password);
        user = result.user;
      } catch (firebaseError: any) {
        console.warn('Firebase auth failed:', firebaseError.code, firebaseError.message);
        
        // Handle various Firebase errors that suggest we should use offline mode
        const shouldUseOfflineMode = (
          firebaseError.code === 'auth/network-request-failed' || 
          firebaseError.code === 'auth/internal-error' ||
          firebaseError.code === 'auth/invalid-api-key' ||
          firebaseError.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' ||
          firebaseError.code === 'auth/project-not-found' ||
          firebaseError.message?.includes('API key not valid') ||
          firebaseError.message?.includes('network request failed') ||
          firebaseError.message?.includes('api-key-not-valid')
        ) && isDevelopment;
        
        if (shouldUseOfflineMode) {
          try {
            console.log('🔄 Switching to offline authentication mode');
            console.log('📝 Available test accounts:', [
              'test@example.com / password123',
              'admin@climabill.com / admin123', 
              'user@test.com / test123',
              'demo@demo.com / demo123'
            ]);
            user = await offlineAuth.loginWithEmailAndPassword(email, password);
            console.log('✅ Offline authentication successful');
            
            // Manually update the user state since onAuthStateChanged won't fire
            updateUserState(user);
          } catch (offlineError: any) {
            console.error('Offline auth error:', offlineError);
            throw offlineError;
          }
        } else {
          throw firebaseError;
        }
      }
      
      // Mark that a redirect is pending to prevent race conditions
      pendingRedirectRef.current = true;
      
      console.log('Login successful for user:', user.uid);
      return user;
    } catch (error: any) {
      console.error('Firebase auth error:', error.code, error.message);
      const errorMessage = handleAuthError(error as AuthError);
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
      
      let result;
      let user;
      
      try {
        result = await createUserWithEmailAndPassword(auth, email, password);
        user = result.user;
      } catch (firebaseError: any) {
        console.warn('Firebase signup failed:', firebaseError.code, firebaseError.message);
        
        // Handle various Firebase errors that suggest we should use offline mode
        const shouldUseOfflineMode = (
          firebaseError.code === 'auth/network-request-failed' || 
          firebaseError.code === 'auth/internal-error' ||
          firebaseError.code === 'auth/invalid-api-key' ||
          firebaseError.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' ||
          firebaseError.code === 'auth/project-not-found' ||
          firebaseError.message?.includes('API key not valid') ||
          firebaseError.message?.includes('network request failed') ||
          firebaseError.message?.includes('api-key-not-valid')
        ) && isDevelopment;
        
        if (shouldUseOfflineMode) {
          try {
            console.log('🔄 Switching to offline authentication mode for signup');
            console.log('📝 Create account with any email and password (min. 6 characters)');
            user = await offlineAuth.createUserWithEmailAndPassword(email, password);
            console.log('✅ Offline signup successful');
            
            // Manually update the user state since onAuthStateChanged won't fire
            updateUserState(user);
          } catch (offlineError: any) {
            console.error('Offline signup error:', offlineError);
            throw offlineError;
          }
        } else {
          throw firebaseError;
        }
      }
      
      console.log('Signup successful, user created:', { 
        uid: user.uid, 
        email: user.email,
        timestamp: new Date().toISOString()
      });
      
      // Mark that a redirect is pending to prevent race conditions
      pendingRedirectRef.current = true;
      
      return user;
    } catch (error: any) {
      console.error('Firebase signup error:', error.code, error.message);
      const errorMessage = handleAuthError(error as AuthError);
      setError(errorMessage);
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
      console.error('Google login error:', error.code, error.message);
      const errorMessage = handleAuthError(error as AuthError);
      setError(errorMessage);
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
      console.error('GitHub login error:', error.code, error.message);
      const errorMessage = handleAuthError(error as AuthError);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Updated logout function without session cookie deletion
  const logout = async () => {
    try {
      // Handle offline auth logout
      if (useOfflineAuth && offlineAuth.currentUser) {
        await offlineAuth.signOut();
        updateUserState(null);
      } else {
        await signOut(auth);
      }
      
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
