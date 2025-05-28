"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { authService } from './auth';
import { useRouter } from 'next/navigation';

// Define the auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  enrollMFA: (phoneNumber: string, recaptchaVerifier: any) => Promise<string>;
  verifyMFA: (verificationId: string, verificationCode: string) => Promise<void>;
  clearError: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.loginWithEmailAndPassword(email, password);
      // Ensure we're using the correct path with the app group
      router.push('/dashboard');
      // Force a refresh to ensure navigation happens
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Register with email and password
  const register = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.registerWithEmailAndPassword(email, password, displayName);
      router.push('/dashboard');
      // Force a refresh to ensure navigation happens
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.signInWithGoogle();
      router.push('/dashboard');
      // Force a refresh to ensure navigation happens
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Login with Github
  const loginWithGithub = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.signInWithGithub();
      router.push('/dashboard');
      // Force a refresh to ensure navigation happens
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        await authService.updateUserPassword(user, currentPassword, newPassword);
      } else {
        throw new Error('No user is currently logged in');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Send verification email
  const sendVerificationEmail = async () => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        await authService.sendVerificationEmail(user);
      } else {
        throw new Error('No user is currently logged in');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Enroll in MFA
  const enrollMFA = async (phoneNumber: string, recaptchaVerifier: any) => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        return await authService.enrollMFA(user, phoneNumber, recaptchaVerifier);
      } else {
        throw new Error('No user is currently logged in');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify MFA
  const verifyMFA = async (verificationId: string, verificationCode: string) => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        await authService.verifyMFA(user, verificationId, verificationCode);
      } else {
        throw new Error('No user is currently logged in');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    loginWithGithub,
    logout,
    resetPassword,
    updatePassword,
    sendVerificationEmail,
    enrollMFA,
    verifyMFA,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
