// @ts-expect-error: Node.js types are required. Ensure @types/node is installed and 'node' is in tsconfig types.
import { cookies } from 'next/headers';
// @ts-expect-error: Node.js types are required. Ensure @types/node is installed and 'node' is in tsconfig types.
import { randomBytes, timingSafeEqual } from 'crypto';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_OPTIONS = {
  httpOnly: false, // must be readable by JS
  secure: (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production'),
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24, // 1 day
};

export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

export function setCsrfTokenCookie(token: string) {
  cookies().set(CSRF_COOKIE_NAME, token, CSRF_COOKIE_OPTIONS);
}

export function getCsrfTokenFromCookie(): string | undefined {
  return cookies().get(CSRF_COOKIE_NAME)?.value;
}

export function getCsrfTokenFromRequest(req: Request): string | undefined {
  return req.headers.get(CSRF_HEADER_NAME) || undefined;
}

export function verifyCsrfToken(request: Request): boolean {
  const cookieToken = getCsrfTokenFromCookie();
  const headerToken = getCsrfTokenFromRequest(request);
  if (!cookieToken || !headerToken) return false;
  try {
    // Use timingSafeEqual to prevent timing attacks
    // @ts-expect-error: Buffer is a Node.js global
    return timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
  } catch {
    return false;
  }
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME }; 