"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook to require authentication for client components
 * Will redirect to login if user is not authenticated
 */
export function useRequireAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [status, router]);
  
  return { 
    session, 
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated"
  };
}
