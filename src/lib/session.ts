import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'koma_session';

/**
 * Generate a cryptographically secure random session ID
 */
export function generateSessionId(): string {
  return 'sess_' + crypto.randomBytes(16).toString('hex');
}

/**
 * Generate a random secret token for client-side author deletion/editing
 */
export function generateAuthorSecret(): string {
  return 'sec_' + crypto.randomBytes(16).toString('hex');
}

/**
 * Hash a secret using SHA-256 for safe database storage
 */
export function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

/**
 * Retrieve or generate session ID from incoming NextRequest
 */
export function getOrCreateSessionId(request: NextRequest): { sessionId: string; isNew: boolean } {
  const existing = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (existing && existing.startsWith('sess_')) {
    return { sessionId: existing, isNew: false };
  }
  return { sessionId: generateSessionId(), isNew: true };
}

/**
 * Attach the session cookie to an outgoing NextResponse
 */
export function applySessionCookie(response: NextResponse, sessionId: string) {
  response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}
