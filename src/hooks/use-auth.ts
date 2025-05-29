"use client";

import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook to require authentication for client components
 * Will redirect to login if user is not authenticated
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Only redirect if we've finished loading and there's no user
    if (!loading && !user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [user, loading, router]);
  
  return { 
    session: user ? { user } : null, 
    isLoading: loading,
    isAuthenticated: !!user
  };
}
