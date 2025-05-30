import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { isRateLimited } from '@/lib/auth/rate-limiter';

/**
 * API route to refresh a session token
 * This extends the user's session without requiring them to log in again
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current session cookie
    const sessionCookie = cookies().get('firebase-session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }
    
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";
    
    // Create a rate limit key
    const rateLimitKey = `refresh-token:${clientIp}`;
    
    // Check if rate limited (using verification as the operation type)
    if (isRateLimited(rateLimitKey, "verification")) {
      return NextResponse.json(
        { 
          error: "Too many refresh attempts",
          message: "Too many refresh attempts. Please try again later."
        },
        { status: 429 }
      );
    }
    
    // Verify the session cookie
    const { auth } = await getFirebaseAdmin();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    
    // Check if the token is about to expire (refresh if less than 1 day remaining)
    const tokenExpiryTime = decodedClaims.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    // If token is not about to expire, return success without refreshing
    if (tokenExpiryTime - currentTime > oneDayInMs) {
      return NextResponse.json({ 
        success: true,
        message: "Session is still valid",
        refreshed: false
      });
    }
    
    // Get a new ID token for the user
    const userRecord = await auth.getUser(decodedClaims.uid);
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    // Create a new session cookie with extended expiration
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const newSessionCookie = await auth.createSessionCookie(customToken, { expiresIn });
    
    // Set the new cookie
    cookies().set('firebase-session', newSessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    
    return NextResponse.json({ 
      success: true,
      message: "Session refreshed successfully",
      refreshed: true
    });
  } catch (error) {
    console.error('Error refreshing session:', error);
    
    // If the session cookie is invalid, clear it
    cookies().set('firebase-session', '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 401 }
    );
  }
}
