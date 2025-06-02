type AuditEventType =
  | 'auth:login'
  | 'auth:logout'
  | 'auth:signup'
  | 'auth:password-reset'
  | 'auth:mfa'
  | 'profile:update'
  | 'billing:action'
  | 'security:rate-limit'
  | 'security:csrf-fail'
  | 'other';

interface AuditEvent {
  eventType: AuditEventType;
  userId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

export function logAuditEvent({
  eventType,
  userId,
  metadata = {},
  ip,
  userAgent,
}: {
  eventType: AuditEventType;
  userId?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}) {
  const event: AuditEvent = {
    eventType,
    userId,
    metadata,
    timestamp: new Date().toISOString(),
    ip,
    userAgent,
  };
  // TODO: Replace with DB/file/external logging
  // eslint-disable-next-line no-console
  console.log('[AUDIT]', JSON.stringify(event));
} 