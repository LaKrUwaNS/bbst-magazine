import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/prisma";
import {
  getSmtpConfig,
  sendMailSafe,
  type SendMailResult,
} from "./transporter";
import {
  getAppBaseUrl,
  renderArticleSubmissionAuthorEmail,
  renderArticleSubmissionEditorAlert,
  renderArticleStatusUpdateEmail,
  renderContactNotificationEditorEmail,
  renderContactConfirmationSenderEmail,
  renderPasswordResetEmail,
  renderMagazinePublishedAlert,
  renderTestEmail,
} from "./email-templates";
import { isValidEmail } from "./email-validation";

/**
 * Persists an email event to the NotificationLog table.
 * Designed to never throw so that business operations are never corrupted.
 */
async function recordNotificationLog(entry: {
  recipient: string;
  type: string;
  subject: string;
  status: "SENT" | "FAILED" | "SIMULATED";
  error?: string | null;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    await prisma.notificationLog.create({
      data: {
        recipient: entry.recipient,
        type: entry.type,
        subject: entry.subject,
        status: entry.status,
        error: entry.error || null,
        metadata: entry.metadata || undefined,
      },
    });
  } catch (err) {
    console.error(
      "[NotificationLog] Failed to record notification entry in database:",
      err instanceof Error ? err.message : String(err)
    );
  }
}

/* =========================================================================
   1. Article Submission Notification
   ========================================================================= */

export interface ArticleSubmissionEmailParams {
  authorName?: string | null;
  authorEmail?: string | null;
  articleTitle: string;
  submissionRef: string;
  category?: string | null;
  articleId?: string;
}

export async function sendArticleSubmissionEmails(
  params: ArticleSubmissionEmailParams
): Promise<{
  authorSendResult: SendMailResult;
  editorSendResult: SendMailResult;
}> {
  const baseUrl = getAppBaseUrl();
  const config = getSmtpConfig();
  const resolvedAuthorName = params.authorName?.trim() || "Contributing Author";

  // 1. Author Confirmation Email
  const trackUrl = `${baseUrl}/submit?ref=${encodeURIComponent(params.submissionRef)}`;
  const authorEmailData = renderArticleSubmissionAuthorEmail({
    authorName: resolvedAuthorName,
    articleTitle: params.articleTitle,
    submissionRef: params.submissionRef,
    trackUrl,
  });

  let authorSendResult: SendMailResult;
  if (params.authorEmail && isValidEmail(params.authorEmail)) {
    authorSendResult = await sendMailSafe({
      to: params.authorEmail,
      subject: authorEmailData.subject,
      html: authorEmailData.html,
      text: authorEmailData.text,
      category: "SUBMISSION_CONFIRMATION",
    });

    await recordNotificationLog({
      recipient: params.authorEmail,
      type: "SUBMISSION_CONFIRMATION",
      subject: authorEmailData.subject,
      status: authorSendResult.simulated
        ? "SIMULATED"
        : authorSendResult.success
          ? "SENT"
          : "FAILED",
      error: authorSendResult.error,
      metadata: {
        submissionRef: params.submissionRef,
        articleTitle: params.articleTitle,
        articleId: params.articleId,
      },
    });
  } else {
    authorSendResult = {
      success: false,
      simulated: false,
      error: "Invalid or missing author email address",
    };
  }

  // 2. Editor Alert Email
  const reviewUrl = `${baseUrl}/admin/editorial`;
  const editorEmailData = renderArticleSubmissionEditorAlert({
    authorName: resolvedAuthorName,
    authorEmail: params.authorEmail || "unspecified@bbst.ac.lk",
    articleTitle: params.articleTitle,
    submissionRef: params.submissionRef,
    category: params.category || undefined,
    reviewUrl,
  });

  const editorRecipient = config.editorNotificationEmail;
  const editorSendResult = await sendMailSafe({
    to: editorRecipient,
    subject: editorEmailData.subject,
    html: editorEmailData.html,
    text: editorEmailData.text,
    replyTo: params.authorEmail && isValidEmail(params.authorEmail) ? params.authorEmail : undefined,
    category: "SUBMISSION_EDITOR_ALERT",
  });

  await recordNotificationLog({
    recipient: editorRecipient,
    type: "SUBMISSION_EDITOR_ALERT",
    subject: editorEmailData.subject,
    status: editorSendResult.simulated
      ? "SIMULATED"
      : editorSendResult.success
        ? "SENT"
        : "FAILED",
    error: editorSendResult.error,
    metadata: {
      submissionRef: params.submissionRef,
      authorName: resolvedAuthorName,
      authorEmail: params.authorEmail,
      articleId: params.articleId,
    },
  });

  return { authorSendResult, editorSendResult };
}

/* =========================================================================
   2. Article Status Change Notification
   ========================================================================= */

export interface ArticleStatusChangeEmailParams {
  authorName?: string | null;
  authorEmail?: string | null;
  articleTitle: string;
  submissionRef: string;
  status: "APPROVED" | "PUBLISHED" | "REVISION_REQUESTED" | "REJECTED";
  editorialFeedback?: string | null;
  rejectionReason?: string | null;
  slug?: string | null;
  articleId?: string;
}

export async function sendArticleStatusNotification(
  params: ArticleStatusChangeEmailParams
): Promise<SendMailResult> {
  const baseUrl = getAppBaseUrl();

  if (!params.authorEmail || !isValidEmail(params.authorEmail)) {
    return {
      success: false,
      simulated: false,
      error: "Invalid or missing author email address",
    };
  }

  let actionUrl = `${baseUrl}/submit?ref=${encodeURIComponent(params.submissionRef)}`;
  if (params.status === "PUBLISHED" && params.slug) {
    actionUrl = `${baseUrl}/articles/${encodeURIComponent(params.slug)}`;
  } else if (params.status === "REVISION_REQUESTED") {
    actionUrl = `${baseUrl}/submit?ref=${encodeURIComponent(params.submissionRef)}#revision`;
  }

  const emailData = renderArticleStatusUpdateEmail({
    authorName: params.authorName?.trim() || "Contributing Author",
    articleTitle: params.articleTitle,
    submissionRef: params.submissionRef,
    status: params.status,
    editorialFeedback: params.editorialFeedback,
    rejectionReason: params.rejectionReason,
    actionUrl,
  });

  const result = await sendMailSafe({
    to: params.authorEmail,
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text,
    category: "STATUS_UPDATE",
  });

  await recordNotificationLog({
    recipient: params.authorEmail,
    type: "STATUS_UPDATE",
    subject: emailData.subject,
    status: result.simulated
      ? "SIMULATED"
      : result.success
        ? "SENT"
        : "FAILED",
    error: result.error,
    metadata: {
      submissionRef: params.submissionRef,
      status: params.status,
      articleTitle: params.articleTitle,
      articleId: params.articleId,
    },
  });

  return result;
}

/* =========================================================================
   3. Contact / Inquiry Form Notifications
   ========================================================================= */

export interface ContactFormEmailParams {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

export async function sendContactFormEmails(
  params: ContactFormEmailParams
): Promise<{
  editorResult: SendMailResult;
  senderResult: SendMailResult;
}> {
  const config = getSmtpConfig();

  // 1. Send inquiry details to Editor notification inbox
  const editorData = renderContactNotificationEditorEmail({
    name: params.name,
    email: params.email,
    subject: params.subject,
    category: params.category,
    message: params.message,
  });

  const editorResult = await sendMailSafe({
    to: config.editorNotificationEmail,
    subject: editorData.subject,
    html: editorData.html,
    text: editorData.text,
    replyTo: params.email,
    category: "CONTACT_MESSAGE",
  });

  await recordNotificationLog({
    recipient: config.editorNotificationEmail,
    type: "CONTACT_MESSAGE",
    subject: editorData.subject,
    status: editorResult.simulated
      ? "SIMULATED"
      : editorResult.success
        ? "SENT"
        : "FAILED",
    error: editorResult.error,
    metadata: {
      senderName: params.name,
      senderEmail: params.email,
      category: params.category,
    },
  });

  // 2. Send receipt confirmation to sender
  let senderResult: SendMailResult;
  if (isValidEmail(params.email)) {
    const senderData = renderContactConfirmationSenderEmail({
      name: params.name,
      subject: params.subject,
      category: params.category,
    });

    senderResult = await sendMailSafe({
      to: params.email,
      subject: senderData.subject,
      html: senderData.html,
      text: senderData.text,
      category: "CONTACT_CONFIRMATION",
    });

    await recordNotificationLog({
      recipient: params.email,
      type: "CONTACT_CONFIRMATION",
      subject: senderData.subject,
      status: senderResult.simulated
        ? "SIMULATED"
        : senderResult.success
          ? "SENT"
          : "FAILED",
      error: senderResult.error,
      metadata: {
        category: params.category,
      },
    });
  } else {
    senderResult = {
      success: false,
      simulated: false,
      error: "Invalid sender email address",
    };
  }

  return { editorResult, senderResult };
}

/* =========================================================================
   4. Password Recovery Notification
   ========================================================================= */

export interface PasswordResetEmailParams {
  email: string;
  resetToken: string;
  expiresInMinutes?: number;
}

export async function sendPasswordResetEmail(
  params: PasswordResetEmailParams
): Promise<SendMailResult> {
  const baseUrl = getAppBaseUrl();
  const expiresInMinutes = params.expiresInMinutes ?? 30;
  const resetUrl = `${baseUrl}/admin/reset-password?token=${encodeURIComponent(params.resetToken)}`;

  const emailData = renderPasswordResetEmail({
    resetUrl,
    expiresInMinutes,
  });

  const result = await sendMailSafe({
    to: params.email,
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text,
    category: "PASSWORD_RESET",
  });

  await recordNotificationLog({
    recipient: params.email,
    type: "PASSWORD_RESET",
    subject: emailData.subject,
    status: result.simulated
      ? "SIMULATED"
      : result.success
        ? "SENT"
        : "FAILED",
    error: result.error,
    metadata: {
      expiresInMinutes,
    },
  });

  return result;
}

/* =========================================================================
   5. Magazine Issue Publication Alert
   ========================================================================= */

export interface MagazinePublishedAlertParams {
  issueTitle: string;
  issueNumber: string;
  description?: string | null;
  coverImageUrl?: string | null;
  slug: string;
  downloadUrl?: string | null;
}

export async function sendMagazinePublishedAlert(
  params: MagazinePublishedAlertParams
): Promise<SendMailResult> {
  const baseUrl = getAppBaseUrl();
  const config = getSmtpConfig();
  const readUrl = `${baseUrl}/magazines/${encodeURIComponent(params.slug)}`;

  const emailData = renderMagazinePublishedAlert({
    issueTitle: params.issueTitle,
    issueNumber: params.issueNumber,
    description: params.description,
    coverImageUrl: params.coverImageUrl,
    readUrl,
    downloadUrl: params.downloadUrl,
  });

  // Dispatches to the editor notification address to confirm publication broadcast
  const result = await sendMailSafe({
    to: config.editorNotificationEmail,
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text,
    category: "MAGAZINE_ALERT",
  });

  await recordNotificationLog({
    recipient: config.editorNotificationEmail,
    type: "MAGAZINE_ALERT",
    subject: emailData.subject,
    status: result.simulated
      ? "SIMULATED"
      : result.success
        ? "SENT"
        : "FAILED",
    error: result.error,
    metadata: {
      issueTitle: params.issueTitle,
      issueNumber: params.issueNumber,
      slug: params.slug,
    },
  });

  return result;
}

/* =========================================================================
   6. Diagnostic Test Email
   ========================================================================= */

export interface DiagnosticTestEmailParams {
  recipient: string;
  notes?: string;
}

export async function sendDiagnosticTestEmail(
  params: DiagnosticTestEmailParams
): Promise<SendMailResult> {
  const config = getSmtpConfig();
  const timestamp = new Date().toUTCString();
  const environment = process.env.NODE_ENV || "development";

  const emailData = renderTestEmail({
    recipient: params.recipient,
    timestamp,
    environment: `${environment} (SMTP: ${config.host}:${config.port})`,
    notes: params.notes,
  });

  const result = await sendMailSafe({
    to: params.recipient,
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text,
    category: "SYSTEM_TEST",
  });

  await recordNotificationLog({
    recipient: params.recipient,
    type: "SYSTEM_TEST",
    subject: emailData.subject,
    status: result.simulated
      ? "SIMULATED"
      : result.success
        ? "SENT"
        : "FAILED",
    error: result.error,
    metadata: {
      timestamp,
      notes: params.notes,
    },
  });

  return result;
}
