"use client";

import { createContext, useContext, useEffect, useState } from 'react';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Helper function to create a session cookie (non-blocking)
  const createSessionCookie = async (user: User) => {
    try {
      // Get the ID token
      const idToken = await getIdToken(user);
      
      // Call the session API to create a session cookie (non-blocking)
      // We don't await this to avoid blocking the UI
      fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      }).catch(err => {
        // Silently handle errors
      });
      
      return true;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Set user state without excessive logging
      setUser(user);
      setLoading(false);
      
      // Redirect logic with setTimeout to avoid blocking rendering
      if (user) {
        const currentPath = window.location.pathname;
        if (currentPath === '/auth/signin' || 
            currentPath === '/login' || 
            currentPath === '/signup' || 
            currentPath === '/auth/signup') {
          // Use setTimeout to defer navigation until after render
          setTimeout(() => {
            router.push('/dashboard');
          }, 0);
        }
      }
    });

    return unsubscribe;
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      // Remove excessive logging
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Create a session cookie for server-side authentication (don't await)
      createSessionCookie(result.user);
      
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
      
      // Create a session cookie for server-side authentication
      const sessionCreated = await createSessionCookie(result.user);
      console.log('Session cookie creation result:', sessionCreated);
      
      // Explicitly redirect to dashboard after successful signup
      console.log('Redirecting to dashboard after signup at:', new Date().toISOString());
      router.push('/dashboard');
      
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
      
      // Create a session cookie for server-side authentication
      await createSessionCookie(result.user);
      
      return result.user;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGithub = async () => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Create a session cookie for server-side authentication
      await createSessionCookie(result.user);
      
      return result.user;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      
      // Clear the session cookie
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
      
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
