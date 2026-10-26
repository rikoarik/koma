import { NextRequest } from 'next/server';

/**
 * Server-side admin authorization verification
 * Checks both Bearer token header and HTTP-only cookie
 * 
 * STRICT ZERO-FALLBACK SECURITY POLICY:
 * ADMIN_PASSWORD MUST be explicitly configured via process.env.ADMIN_PASSWORD.
 * If unset, empty, or whitespace-only, all administrative authorizations are
 * strictly REJECTED (fail-closed).
 * NEVER provide hardcoded string fallbacks in the codebase.
 */
export function verifyAdminAuth(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Fail-closed: Never allow access if ADMIN_PASSWORD is missing or blank
  if (!adminPassword || typeof adminPassword !== 'string' || adminPassword.trim() === '') {
    if (process.env.NODE_ENV !== 'test') {
      console.error('[SECURITY FATAL] ADMIN_PASSWORD environment variable is NOT set. Denying all administrative access.');
    }
    return false;
  }

  const authHeader = request.headers.get('authorization') || '';
  const cookieAdmin = request.cookies.get('koma_admin_auth')?.value;

  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token.length > 0 && token === adminPassword) {
      return true;
    }
  }

  if (cookieAdmin && cookieAdmin.length > 0 && cookieAdmin === adminPassword) {
    return true;
  }

  return false;
}

