import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { isValidEmail, sanitizeEmailHeader } from "./email-validation";

/**
 * Server-only SMTP Configuration interface
 */
export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password?: string;
  fromName: string;
  fromEmail: string;
  editorNotificationEmail: string;
}

/**
 * Load and validate SMTP configuration from environment variables.
 */
export function getSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER || "ceylonnest.org@gmail.com";
  const password = process.env.SMTP_PASSWORD;
  const fromName = process.env.EMAIL_FROM_NAME || "BBST Magazine";
  const fromEmail = process.env.EMAIL_FROM || "ceylonnest.org@gmail.com";
  const editorNotificationEmail =
    process.env.EDITOR_NOTIFICATION_EMAIL || "ceylonnest.org@gmail.com";

  return {
    host,
    port,
    secure,
    user,
    password,
    fromName,
    fromEmail,
    editorNotificationEmail,
  };
}

/**
 * Check whether real Gmail SMTP credentials have been supplied or if they are in placeholder/fallback state.
 */
export function isSmtpConfigured(): boolean {
  const config = getSmtpConfig();
  if (!config.password) return false;
  const pwd = config.password.trim();
  if (
    pwd === "" ||
    pwd === "your_new_gmail_app_password" ||
    pwd === "placeholder" ||
    pwd.includes("placeholder") ||
    pwd.length < 8
  ) {
    return false;
  }
  return isValidEmail(config.user);
}

// Global singleton cache for development hot reloading
const globalForSmtp = globalThis as unknown as {
  smtpTransporter?: Transporter;
};

/**
 * Creates or retrieves the singleton Nodemailer Transporter instance.
 */
export function getTransporter(): Transporter | null {
  const config = getSmtpConfig();

  if (!isSmtpConfigured()) {
    return null;
  }

  if (!globalForSmtp.smtpTransporter) {
    globalForSmtp.smtpTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      rateLimit: 5,
    });
  }

  return globalForSmtp.smtpTransporter;
}

/**
 * Test SMTP connection readiness without sending an email.
 */
export async function verifySmtpConnection(): Promise<{
  ok: boolean;
  message: string;
  simulated: boolean;
}> {
  const config = getSmtpConfig();

  if (!isSmtpConfigured()) {
    return {
      ok: true,
      simulated: true,
      message:
        "Gmail SMTP credentials are in development fallback mode (placeholder password detected). Outgoing emails are safely simulated and logged.",
    };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return {
      ok: false,
      simulated: false,
      message: "Failed to initialize Nodemailer transporter.",
    };
  }

  try {
    await transporter.verify();
    return {
      ok: true,
      simulated: false,
      message: `Successfully connected and authenticated with ${config.host}:${config.port} as ${config.user}.`,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      simulated: false,
      message: `SMTP connection verification failed: ${errorMsg}`,
    };
  }
}

export interface SendMailParams {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  category?: string;
}

export interface SendMailResult {
  success: boolean;
  messageId?: string;
  simulated: boolean;
  error?: string;
}

/**
 * Resilient, safe email delivery handler.
 * - If SMTP credentials are valid, transmits via Gmail SMTP.
 * - If unconfigured/placeholder, safely logs the email payload and marks as SIMULATED.
 * - Never throws unhandled exceptions that could break upstream business mutations.
 */
export async function sendMailSafe(params: SendMailParams): Promise<SendMailResult> {
  const config = getSmtpConfig();
  const sanitizedSubject = sanitizeEmailHeader(params.subject);
  const formattedFrom = `"${sanitizeEmailHeader(config.fromName)}" <${config.fromEmail}>`;

  // Check if we are running in simulated/fallback mode
  if (!isSmtpConfigured()) {
    const simId = `sim-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    console.info(
      `[EMAIL SIMULATION] [${params.category || "GENERAL"}] To: ${Array.isArray(params.to) ? params.to.join(", ") : params.to} | Subject: "${sanitizedSubject}" (ID: ${simId})`
    );
    return {
      success: true,
      simulated: true,
      messageId: simId,
    };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return {
      success: false,
      simulated: false,
      error: "Transporter not available",
    };
  }

  try {
    const info = await transporter.sendMail({
      from: formattedFrom,
      to: params.to,
      replyTo: params.replyTo ? sanitizeEmailHeader(params.replyTo) : undefined,
      subject: sanitizedSubject,
      text: params.text,
      html: params.html,
    });

    return {
      success: true,
      simulated: false,
      messageId: info.messageId,
    };
  } catch (err) {
    const errString = err instanceof Error ? err.message : String(err);
    console.error(`[EMAIL ERROR] Failed to send email to ${JSON.stringify(params.to)}:`, errString);
    return {
      success: false,
      simulated: false,
      error: errString,
    };
  }
}
