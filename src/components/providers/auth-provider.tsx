"use client";

import { AuthProvider as FirebaseAuthProvider } from "@/lib/firebase/auth-context";

// Re-export the Firebase AuthProvider for backward compatibility
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}
