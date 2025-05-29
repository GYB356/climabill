import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

/**
 * API route to create a session cookie when a user logs in with Firebase
 * This allows server components and API routes to verify the user's authentication
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json(
        { error: 'Missing ID token' },
        { status: 400 }
      );
    }
    
    // Verify the ID token
    const { auth } = await getFirebaseAdmin();
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Create a session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    
    // Set the cookie
    cookies().set('firebase-session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 401 }
    );
  }
}

/**
 * API route to clear the session cookie when a user logs out
 */
export async function DELETE() {
  cookies().set('firebase-session', '', {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });
  
  return NextResponse.json({ success: true });
}
