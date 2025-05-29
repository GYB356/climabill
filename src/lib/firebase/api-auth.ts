import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from './get-server-user';
import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Middleware to protect API routes with Firebase authentication
 * This is a replacement for the getServerSession from NextAuth in API routes
 * 
 * @param handler The API route handler function
 * @returns A new handler function that checks authentication before calling the original handler
 */
export function withAuth<T>(
  handler: (req: NextRequest, user: DecodedIdToken) => Promise<T>
) {
  return async (req: NextRequest) => {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return handler(req, user);
  };
}

/**
 * Middleware to protect API routes with Firebase authentication and role check
 * 
 * @param handler The API route handler function
 * @param requiredRole The role required to access the API route
 * @returns A new handler function that checks authentication and authorization before calling the original handler
 */
export function withAuthRole<T>(
  handler: (req: NextRequest, user: DecodedIdToken) => Promise<T>,
  requiredRole: string
) {
  return async (req: NextRequest) => {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if the user has the required role
    const userRole = user.role || user.claims?.role;
    if (userRole !== requiredRole) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return handler(req, user);
  };
}
