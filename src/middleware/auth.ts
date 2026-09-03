import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import crypto from 'crypto';

export interface AuthRequest extends Request {
  user?: DecodedIdToken | { uid: string; email: string; role: string; name?: string };
}

// In-memory or env-backed admin session store (with fallback)
const ADMIN_SESSIONS = new Map<string, { email: string; name?: string; expiresAt: number }>();
const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET || 'news-admin-secret-key-salt-987';

/**
 * Creates a tamper-proof signed admin session token that survives server restarts.
 * Format: adm.<base64url(payload)>.<signature>
 */
export function createAdminSession(email: string, name: string = 'Admin'): string {
  const payload = {
    email,
    name,
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 3600 * 1000, // 7 days
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payloadB64)
    .digest('base64url');
  const token = `adm.${payloadB64}.${signature}`;

  // Keep in memory as well
  ADMIN_SESSIONS.set(token, { email, name, expiresAt: payload.exp });
  return token;
}

/**
 * Verifies if the token is a valid signed admin session.
 */
export function verifyAdminSession(token: string): { email: string; name?: string; role: string } | null {
  if (!token || typeof token !== 'string') return null;

  // Handle signed admin token: adm.<payload>.<sig>
  if (token.startsWith('adm.')) {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [, payloadB64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(payloadB64)
      .digest('base64url');

    try {
      const sigBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expectedSig);
      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return null;
      }

      const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
      if (!payload.email) return null;
      if (payload.exp && Date.now() > payload.exp) {
        return null;
      }
      return {
        email: payload.email,
        name: payload.name || 'Admin',
        role: payload.role || 'admin',
      };
    } catch {
      return null;
    }
  }

  // Check in-memory map for older hex tokens
  const session = ADMIN_SESSIONS.get(token);
  if (session) {
    if (Date.now() > session.expiresAt) {
      ADMIN_SESSIONS.delete(token);
      return null;
    }
    return { email: session.email, name: session.name || 'Admin', role: 'admin' };
  }

  return null;
}

/**
 * Validates whether a token string has the basic structural shape of a Firebase JWT:
 * 3 non-empty dot-separated base64url segments, and RS256 algorithm in the header.
 */
export function isPotentialFirebaseJwt(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  if (!parts[0] || !parts[1] || !parts[2]) return false;

  try {
    const headerStr = Buffer.from(parts[0], 'base64url').toString('utf8');
    const header = JSON.parse(headerStr);
    return Boolean(header && typeof header === 'object' && header.alg === 'RS256');
  } catch {
    return false;
  }
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization header' });
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token || token === 'undefined' || token === 'null') {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  // 1. Check custom admin session token
  const customSession = verifyAdminSession(token);
  if (customSession) {
    req.user = {
      uid: 'admin-' + customSession.email,
      email: customSession.email,
      name: customSession.name || 'Admin',
      role: customSession.role || 'admin',
    };
    return next();
  }

  // 2. Check if this could be a Firebase ID Token (JWT)
  if (!isPotentialFirebaseJwt(token)) {
    // Not a Firebase JWT, reject immediately without calling verifyIdToken
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }

  // 3. Fallback to Firebase ID Token
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch {
    // Return clean 401 without throwing or unhandled rejection
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
};

