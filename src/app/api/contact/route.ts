import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/email/email-validation";
import { sendContactFormEmails } from "@/lib/email/email-service";

// In-memory sliding window rate limiter for contact form submissions
const contactIpMap = new Map<string, { count: number; expiresAt: number }>();
const MAX_CONTACT_PER_HOUR = 6;
const WINDOW_MS = 60 * 60 * 1000;

function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = contactIpMap.get(ip);

  if (!entry || now > entry.expiresAt) {
    contactIpMap.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_CONTACT_PER_HOUR) {
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

    if (!checkContactRateLimit(ip)) {
      return NextResponse.json(
        {
          error:
            "Too many requests from this network. Please wait a while before sending another inquiry.",
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    const { name, email, subject, category, message } = parsed.data;

    // Dispatches notification to editor desk and confirmation receipt to sender
    const { editorResult } = await sendContactFormEmails({
      name,
      email,
      subject,
      category,
      message,
    });

    if (!editorResult.success && !editorResult.simulated) {
      console.warn(
        "[Contact API] Email transmission issue encountered:",
        editorResult.error
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Your message has been delivered to the BBST Magazine editorial team. A confirmation has been dispatched to your email address.",
    });
  } catch (error) {
    console.error("[Contact API] Internal error processing inquiry:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your message. Please try again later." },
      { status: 500 }
    );
  }
}
