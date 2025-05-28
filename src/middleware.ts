import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];

export function middleware(request: NextRequest) {
  // Get the path from the request
  const path = request.nextUrl.pathname;
  
  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith('/api/auth/') || path.startsWith('/_next/')
  );
  
  // Get the session token from cookies
  const sessionCookie = request.cookies.get('session');
  const isAuthenticated = !!sessionCookie;
  
  // If the route is not public and the user is not authenticated, redirect to login
  if (!isPublicRoute && !isAuthenticated) {
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
