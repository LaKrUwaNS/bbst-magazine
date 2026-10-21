import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { testEmailSchema } from "@/lib/email/email-validation";
import {
  getSmtpConfig,
  isSmtpConfigured,
  verifySmtpConnection,
} from "@/lib/email/transporter";
import { sendDiagnosticTestEmail } from "@/lib/email/email-service";

/**
 * GET /api/admin/email/test
 * Returns SMTP configuration status, connectivity verification, and recent notification history.
 * Strictly protected by editor session.
 */
export async function GET() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const config = getSmtpConfig();
    const configured = isSmtpConfigured();
    const connectivity = await verifySmtpConnection();

    // Fetch recent notification logs
    const recentLogs = await prisma.notificationLog.findMany({
      take: 25,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        configured,
        server: {
          host: config.host,
          port: config.port,
          secure: config.secure,
          user: config.user,
          fromName: config.fromName,
          fromEmail: config.fromEmail,
          editorNotificationEmail: config.editorNotificationEmail,
        },
        connectivity,
        recentLogs,
      },
    });
  } catch (error) {
    console.error("[AdminEmail API] Error retrieving email diagnostic data:", error);
    return NextResponse.json(
      { error: "Failed to retrieve email diagnostics." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/email/test
 * Triggers a controlled diagnostic test email to an authorized administrator.
 */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = testEmailSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    const { recipient, notes } = parsed.data;

    const result = await sendDiagnosticTestEmail({
      recipient,
      notes: notes || `Diagnostic test initiated by ${session.username || "editor"}`,
    });

    if (!result.success && !result.simulated) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to dispatch diagnostic email via SMTP.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      simulated: result.simulated,
      messageId: result.messageId,
      message: result.simulated
        ? `Diagnostic test simulated successfully for ${recipient} (development fallback mode).`
        : `Diagnostic verification email dispatched via Gmail SMTP to ${recipient}.`,
    });
  } catch (error) {
    console.error("[AdminEmail API] Error executing diagnostic test:", error);
    return NextResponse.json(
      { error: "Failed to send diagnostic test email." },
      { status: 500 }
    );
  }
}
