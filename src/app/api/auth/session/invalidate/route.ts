import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

/**
 * API route to invalidate a user's session
 * This is useful for security-sensitive operations like password changes or suspicious activity
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
    
    // Verify the session cookie to get the user ID
    const { auth } = await getFirebaseAdmin();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Revoke all refresh tokens for the user
    // This will invalidate all sessions for this user on all devices
    await auth.revokeRefreshTokens(uid);
    
    // Clear the session cookie
    cookies().set('firebase-session', '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    
    return NextResponse.json({ 
      success: true,
      message: "All sessions have been invalidated"
    });
  } catch (error) {
    console.error('Error invalidating sessions:', error);
    
    // Clear the session cookie anyway
    cookies().set('firebase-session', '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    
    return NextResponse.json(
      { error: 'Failed to invalidate sessions' },
      { status: 500 }
    );
  }
}
