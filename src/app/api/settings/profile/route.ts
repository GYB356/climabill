import { NextRequest, NextResponse } from 'next/server';
import { verifyCsrfToken } from '@/lib/auth/csrf';
import { logAuditEvent } from '@/lib/log/audit';

export async function POST(request: NextRequest) {
  // CSRF protection
  if (!verifyCsrfToken(request)) {
    logAuditEvent({
      eventType: 'security:csrf-fail',
      userId: undefined,
      metadata: { reason: 'Invalid or missing CSRF token' },
      ip: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });
    return NextResponse.json(
      { error: 'Invalid or missing CSRF token' },
      { status: 403 }
    );
  }
  const { name, email } = await request.json();
  if (!name || !email) {
    logAuditEvent({
      eventType: 'profile:update',
      userId: undefined, // Replace with real userId when available
      metadata: { error: 'Missing name or email', name, email },
      ip: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });
    return NextResponse.json(
      { error: 'Name and email are required.' },
      { status: 400 }
    );
  }
  // TODO: Add authentication and update user in DB
  // For now, mock userId
  const userId = 'mock-user-id';
  logAuditEvent({
    eventType: 'profile:update',
    userId,
    metadata: { name, email },
    ip: request.headers.get('x-forwarded-for') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  });
  // Simulate DB update
  return NextResponse.json({ success: true, userId, name, email });
} 