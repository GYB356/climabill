import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Since we're not using server-side session cookies, just return client info
    const headers = {
      'user-agent': request.headers.get('user-agent') || 'unknown',
      'referer': request.headers.get('referer') || 'none'
    };
    
    return NextResponse.json({
      authenticated: false, // Always false since we're using client-side auth only
      user: null,
      mode: 'client-side-only',
      timestamp: new Date().toISOString(),
      headers
    });
  } catch (error) {
    console.error('Auth debug error:', error);
    return NextResponse.json(
      { error: 'Failed to get auth state' },
      { status: 500 }
    );
  }
}
