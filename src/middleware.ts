import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/api/auth', '/_next'];

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/settings', '/invoices', '/customers', '/reports', '/blockchain', '/analytics'];

export function middleware(request: NextRequest) {
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
  
  // Get the session token from cookies
  const sessionCookie = request.cookies.get('session');
  // For development mode, also check for a mock session cookie
  const mockSessionCookie = request.cookies.get('mock_session');
  const isAuthenticated = !!sessionCookie || !!mockSessionCookie || process.env.NODE_ENV === 'development';
  
  // Special case for development mode - always allow access in development
  if (process.env.NODE_ENV === 'development' && isProtectedRoute) {
    // In development, we'll set a mock session cookie if it doesn't exist
    const response = NextResponse.next();
    if (!mockSessionCookie) {
      response.cookies.set('mock_session', 'mock-session-for-development', {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
    }
    return response;
  }
  
  // If the route is not public and the user is not authenticated, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // Store the current path for redirection after login
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }
  
  // If the route is login/signup and the user is authenticated, redirect to dashboard
  if ((path === '/login' || path === '/signup') && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
