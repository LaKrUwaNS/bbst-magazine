import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/email/email-validation";
import { sendPasswordResetEmail } from "@/lib/email/email-service";

// In-memory rate limiting for password recovery requests
const forgotIpMap = new Map<string, { count: number; expiresAt: number }>();
const MAX_REQUESTS = 4;
const WINDOW_MS = 15 * 60 * 1000;

function checkForgotRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = forgotIpMap.get(ip);

  if (!entry || now > entry.expiresAt) {
    forgotIpMap.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!checkForgotRateLimit(ip)) {
      return NextResponse.json(
        {
          error: "Too many password recovery requests. Please wait a few minutes before trying again.",
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const cleanEmail = parsed.data.email.toLowerCase().trim();

    // Check if account exists (configured editor email or in User database)
    const configuredUsername = (process.env.EDITOR_USERNAME || "editor@bbst.uwu.ac.lk").toLowerCase().trim();
    const notificationEmail = (process.env.EDITOR_NOTIFICATION_EMAIL || "ceylonnest.org@gmail.com").toLowerCase().trim();

    const isConfiguredAdmin = cleanEmail === configuredUsername || cleanEmail === notificationEmail;
    const dbUser = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: "insensitive" as const } },
    });

    // To prevent account enumeration attacks, always respond with success
    if (isConfiguredAdmin || dbUser) {
      // Generate 256-bit cryptographically secure token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

      // Invalidate existing active tokens for this identifier
      await prisma.verification.deleteMany({
        where: { identifier: cleanEmail },
      }).catch(() => null);

      // Persist hashed token with 30-minute expiry
      await prisma.verification.create({
        data: {
          id: crypto.randomUUID(),
          identifier: cleanEmail,
          value: tokenHash,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        },
      });

      // Dispatch reset email
      await sendPasswordResetEmail({
        email: cleanEmail,
        resetToken: rawToken,
        expiresInMinutes: 30,
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "If an editorial account is associated with this email address, a password reset link has been dispatched. Please review your inbox.",
    });
  } catch (error) {
    console.error("[ForgotPassword API] Error processing recovery request:", error);
    return NextResponse.json(
      { error: "Failed to process password recovery request. Please try again." },
      { status: 500 }
    );
  }
}
