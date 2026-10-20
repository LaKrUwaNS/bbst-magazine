import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  setAdminSessionCookie,
  checkLoginRateLimit,
  recordLoginFailure,
  recordLoginSuccess,
} from "@/lib/admin-auth";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 1. Rate limiting check
    const rateLimit = checkLoginRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    // 2. Validate input schema
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid username or password format." },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;

    // 3. Retrieve configured editor credentials
    const configuredUsername = process.env.EDITOR_USERNAME || "editor@bbst.uwu.ac.lk";
    const configuredPasswordHash = process.env.EDITOR_PASSWORD_HASH;

    if (!configuredPasswordHash) {
      console.error(
        "[AdminLogin] Critical misconfiguration: EDITOR_PASSWORD_HASH is not set in environment variables."
      );
      return NextResponse.json(
        { error: "Authentication system is not properly configured." },
        { status: 500 }
      );
    }

    // 4. Constant-time credential verification
    const usernameMatches = username.toLowerCase() === configuredUsername.toLowerCase();
    const passwordMatches = verifyPassword(password, configuredPasswordHash);

    if (!usernameMatches || !passwordMatches) {
      recordLoginFailure(ip);
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // 5. Successful login
    recordLoginSuccess(ip);

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      redirect: "/admin",
    });

    setAdminSessionCookie(response, configuredUsername);
    return response;
  } catch (error) {
    console.error("[AdminLogin] Unexpected error during authentication:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
