import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-request', '/api/auth', '/_next'];

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/settings', '/invoices', '/customers', '/reports', '/blockchain', '/analytics'];

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
  
  // Get the session token using next-auth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  const isAuthenticated = !!token;
  
  // If the route is protected and the user is not authenticated, redirect to signin
  if (isProtectedRoute && !isAuthenticated) {
    const signinUrl = new URL('/auth/signin', request.url);
    // Store the current path for redirection after login
    signinUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(signinUrl);
  }
  
  // If the route is signin/signup and the user is authenticated, redirect to dashboard
  if ((path === '/auth/signin' || path === '/auth/signup') && isAuthenticated) {
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
