import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];

/**
 * Custom hook to protect routes based on authentication status
 * @param redirectIfAuthenticated - Optional path to redirect to if user is authenticated
 * @param redirectIfUnauthenticated - Optional path to redirect to if user is not authenticated
 */
export function useAuthProtection(
  redirectIfAuthenticated?: string,
  redirectIfUnauthenticated?: string
) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything while auth state is loading
    if (loading) return;

    const isPublicRoute = publicRoutes.includes(pathname);
    
    // If user is authenticated and we're on a page that should redirect authenticated users
    if (user && redirectIfAuthenticated && isPublicRoute) {
      router.push(redirectIfAuthenticated);
      return;
    }
    
    // If user is not authenticated and we're not on a public route
    if (!user && !isPublicRoute && redirectIfUnauthenticated) {
      // Store the attempted URL for later redirection
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push(redirectIfUnauthenticated);
      return;
    }
  }, [user, loading, pathname, redirectIfAuthenticated, redirectIfUnauthenticated, router]);

  return { user, loading };
}
