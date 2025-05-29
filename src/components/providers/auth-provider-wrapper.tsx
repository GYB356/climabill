"use client";

import { AuthProvider as FirebaseAuthProvider } from '@/lib/firebase/auth-context';

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseAuthProvider>
      {children}
    </FirebaseAuthProvider>
  );
}
