import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE_NAME = "bbst_editor_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours

/**
 * Derives the server secret for HMAC signing.
 */
function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "[AdminAuth] Critical error: AUTH_SECRET or BETTER_AUTH_SECRET must be configured with at least 16 characters."
    );
  }
  return secret;
}

/**
 * Password Hashing with scrypt and random salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Constant-time password verification using scrypt.
 */
export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, keyBuffer.length);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

interface TokenPayload {
  username: string;
  role: "EDITOR";
  issuedAt: number;
  expiresAt: number;
}

/**
 * Creates an HMAC SHA-256 signed session token.
 */
export function createAdminToken(username: string): string {
  const secret = getAuthSecret();
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    username,
    role: "EDITOR",
    issuedAt: now,
    expiresAt: now + SESSION_MAX_AGE_SECONDS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies and decodes an HMAC SHA-256 signed session token.
 */
export function verifyAdminToken(token: string): { valid: boolean; username?: string } {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return { valid: false };

    const secret = getAuthSecret();
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length) return { valid: false };
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return { valid: false };

    const payloadStr = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadStr) as TokenPayload;

    const now = Math.floor(Date.now() / 1000);
    if (now > payload.expiresAt) return { valid: false };

    return { valid: true, username: payload.username };
  } catch {
    return { valid: false };
  }
}

/**
 * Reads and verifies the admin session from Next.js request headers / cookies.
 */
export async function getAdminSession(): Promise<{
  authenticated: boolean;
  username?: string;
}> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return { authenticated: false };
    }

    const { valid, username } = verifyAdminToken(sessionCookie.value);
    if (!valid || !username) {
      return { authenticated: false };
    }

    return { authenticated: true, username };
  } catch {
    return { authenticated: false };
  }
}

/**
 * Attaches the secure session cookie to a NextResponse.
 */
export function setAdminSessionCookie(response: NextResponse, username: string): void {
  const token = createAdminToken(username);
  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Clears the session cookie from a NextResponse.
 */
export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * In-memory sliding window rate limiter for login attempts per IP.
 */
interface RateLimitRecord {
  attempts: number;
  firstAttemptTime: number;
  lockedUntil?: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

export function checkLoginRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS, retryAfterSeconds: 0 };
  }

  // Check if currently locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  // Reset if window has elapsed
  if (now - record.firstAttemptTime > WINDOW_MS) {
    rateLimitMap.delete(ip);
    return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS, retryAfterSeconds: 0 };
  }

  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - record.attempts);
  return { allowed: remaining > 0, remainingAttempts: remaining, retryAfterSeconds: 0 };
}

export function recordLoginFailure(ip: string): void {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.firstAttemptTime > WINDOW_MS) {
    rateLimitMap.set(ip, {
      attempts: 1,
      firstAttemptTime: now,
    });
    return;
  }

  record.attempts += 1;
  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }
}

export function recordLoginSuccess(ip: string): void {
  rateLimitMap.delete(ip);
}
