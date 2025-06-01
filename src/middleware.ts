import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/api/auth', '/_next'];

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/settings', '/invoices', '/customers', '/reports', '/blockchain', '/analytics'];

// Define auth routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup', '/auth/signin', '/auth/signup'];

export async function middleware(request: NextRequest) {
  // Get the path from the request
  const path = request.nextUrl.pathname;
  
  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(route)
  );
  
  // Check if the path is explicitly a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    path === route || path.startsWith(route)
  );
  
  // Check if the path is an auth route (login/signup)
  const isAuthRoute = authRoutes.some(route =>
    path === route || path.startsWith(route)
  );
  
  // Get the session token from cookies
  const sessionCookie = request.cookies.get('firebase-session')?.value;
  
  // For development: Be more permissive with authentication checks
  // Since we're using client-side authentication, we can't reliably check auth status in middleware
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // In development, let the client-side ProtectedRoute components handle authentication
  // In production, we'd want proper server-side session validation
  const isAuthenticated = isDevelopment ? true : !!sessionCookie;
  
  // If the route is protected and the user is not authenticated, redirect to login
  // Note: In development, this is disabled to allow client-side auth handling
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // Store the current path for redirection after login
    loginUrl.searchParams.set('callbackUrl', path);
    console.log(`Redirecting to login - no session cookie found for protected route: ${path}`);
    return NextResponse.redirect(loginUrl);
  }
  
  // If the route is an auth route and the user is authenticated, redirect to dashboard
  // In development, let client-side auth handle this logic
  if (isAuthRoute && isAuthenticated && !isDevelopment) {
    console.log(`Redirecting to dashboard - user authenticated on auth route: ${path}`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Handle legacy NextAuth routes - redirect to Firebase auth routes
  if (path === '/auth/signin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (path === '/auth/signup') {
    return NextResponse.redirect(new URL('/signup', request.url));
  }
  
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
