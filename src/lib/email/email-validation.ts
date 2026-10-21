import { z } from "zod";

/**
 * Standard RFC-compliant email regex pattern for runtime verification.
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates an email address.
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  const clean = email.trim();
  if (clean.length < 5 || clean.length > 254) return false;
  return EMAIL_REGEX.test(clean);
}

/**
 * Strips carriage returns, newlines, and control characters to prevent
 * SMTP header injection attacks (e.g. injecting BCC/CC lines).
 */
export function sanitizeEmailHeader(val: string): string {
  return val.replace(/[\r\n\t\x00-\x1F\x7F]/g, " ").trim();
}

/**
 * HTML entities escaping utility for dynamic values inside email templates.
 */
export function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validation schema for public contact and feedback submissions.
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("A valid email address is required")
    .max(254, "Email is too long"),
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(150, "Subject cannot exceed 150 characters"),
  category: z
    .enum(["EDITORIAL", "SUBMISSION_QUERY", "MAGAZINE_PRINT", "EVENT", "GENERAL"])
    .default("GENERAL"),
  message: z
    .string()
    .trim()
    .min(15, "Message must contain at least 15 characters")
    .max(3000, "Message cannot exceed 3000 characters"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

/**
 * Validation schema for administrative test email requests.
 */
export const testEmailSchema = z.object({
  recipient: z.string().trim().email("Valid recipient email is required"),
  notes: z.string().trim().max(200).optional(),
});

export type TestEmailInput = z.infer<typeof testEmailSchema>;

/**
 * Validation schema for password recovery request.
 */
export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Valid email address is required"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Validation schema for password reset confirmation.
 */
export const resetPasswordSchema = z.object({
  token: z.string().trim().min(20, "Invalid reset token format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password is too long"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
