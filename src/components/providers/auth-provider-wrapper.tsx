"use client";

import { ReactNode, useEffect } from "react";
import { registerServiceWorker } from "@/lib/register-sw";
import { AuthProvider as FirebaseAuthProvider } from '@/lib/firebase/auth-context';

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <FirebaseAuthProvider>
      {children}
    </FirebaseAuthProvider>
  );
}
