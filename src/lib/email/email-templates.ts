import { escapeHtml } from "./email-validation";

export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

/**
 * Base layout wrapping all transactional emails with BBST Magazine's premium aesthetic.
 */
function renderBaseHtmlLayout(params: {
  preheader?: string;
  badge?: string;
  title: string;
  contentHtml: string;
  ctaButton?: { label: string; url: string };
  footerNote?: string;
}): string {
  const baseUrl = getAppBaseUrl();
  const preheaderText = params.preheader
    ? `<div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${escapeHtml(params.preheader)}</div>`
    : "";

  const badgeHtml = params.badge
    ? `<div style="display:inline-block;padding:4px 10px;margin-bottom:14px;background-color:#E6FBF0;border:1px solid #B8F3D1;border-radius:100px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;color:#00873D;letter-spacing:0.05em;text-transform:uppercase;">${escapeHtml(params.badge)}</div>`
    : "";

  const ctaHtml = params.ctaButton
    ? `
      <div style="margin-top:28px;margin-bottom:20px;text-align:left;">
        <a href="${escapeHtml(params.ctaButton.url)}" target="_blank" style="display:inline-block;padding:13px 26px;background-color:#171717;color:#FFFFFF;border-radius:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.02em;border-bottom:3px solid #00E500;">
          ${escapeHtml(params.ctaButton.label)} &rarr;
        </a>
      </div>
      <p style="margin:0 0 16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:#6B7280;line-height:1.4;">
        If the button above does not work, copy and paste this link into your browser:<br/>
        <a href="${escapeHtml(params.ctaButton.url)}" style="color:#00A84D;word-break:break-all;">${escapeHtml(params.ctaButton.url)}</a>
      </p>
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(params.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F5F7;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  ${preheaderText}
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F4F5F7;padding:40px 12px 60px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px;background-color:#FFFFFF;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.04);">
          <!-- Brand Header -->
          <tr>
            <td style="background-color:#171717;border-top:4px solid #00E500;padding:28px 36px 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:20px;font-weight:900;letter-spacing:0.06em;color:#FFFFFF;">
                      BBST<span style="color:#00E500;">.</span>
                    </div>
                    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.18em;color:#9CA3AF;text-transform:uppercase;margin-top:3px;">
                      Editorial &amp; Publishing
                    </div>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;padding:3px 9px;border:1px solid #374151;border-radius:4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:10px;color:#D1D5DB;letter-spacing:0.08em;text-transform:uppercase;">
                      Official Dispatch
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding:36px 36px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              ${badgeHtml}
              <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:700;line-height:1.3;color:#111827;letter-spacing:-0.01em;">
                ${escapeHtml(params.title)}
              </h1>
              
              <div style="font-size:15px;line-height:1.65;color:#374151;">
                ${params.contentHtml}
              </div>

              ${ctaHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#FAFAFA;border-top:1px solid #E5E7EB;padding:24px 36px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              ${
                params.footerNote
                  ? `<p style="margin:0 0 12px 0;font-size:12px;line-height:1.5;color:#6B7280;">${params.footerNote}</p>`
                  : ""
              }
              <p style="margin:0 0 8px 0;font-size:12px;color:#9CA3AF;line-height:1.5;">
                This transactional notification was generated by the BBST Magazine publishing platform.<br/>
                &copy; ${new Date().getFullYear()} BBST Magazine. All rights reserved.
              </p>
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                <a href="${baseUrl}" style="color:#6B7280;text-decoration:underline;">Visit Website</a> &bull; 
                <a href="${baseUrl}/contact" style="color:#6B7280;text-decoration:underline;">Contact Desk</a> &bull; 
                <a href="${baseUrl}/submit" style="color:#6B7280;text-decoration:underline;">Author Portal</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* =========================================================================
   1. Article Submission: Author Confirmation
   ========================================================================= */

export interface SubmissionAuthorEmailData {
  authorName: string;
  articleTitle: string;
  submissionRef: string;
  trackUrl: string;
}

export function renderArticleSubmissionAuthorEmail(data: SubmissionAuthorEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Submission Received: "${data.articleTitle}" [${data.submissionRef}]`;
  const contentHtml = `
    <p>Dear ${escapeHtml(data.authorName)},</p>
    <p>Thank you for submitting your work to BBST Magazine. Your article has been received by our editorial desk and is currently queued for initial review.</p>
    
    <div style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-left:4px solid #00E500;border-radius:6px;padding:18px 20px;margin:22px 0;">
      <div style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Article Title</div>
      <div style="font-size:16px;font-weight:600;color:#111827;margin-bottom:12px;">${escapeHtml(data.articleTitle)}</div>
      
      <div style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Tracking Reference</div>
      <div style="font-family:monospace;font-size:14px;font-weight:600;color:#00873D;">${escapeHtml(data.submissionRef)}</div>
    </div>

    <p style="font-size:14px;color:#4B5563;">
      <strong>What happens next?</strong><br/>
      Our editorial board will evaluate your piece for editorial guidelines, factual integrity, and depth. You will receive an automated email as soon as an editor completes the review or requests revisions.
    </p>
  `;

  const html = renderBaseHtmlLayout({
    preheader: `We have received your article submission "${data.articleTitle}".`,
    badge: "Submission Confirmed",
    title: "Article Received for Review",
    contentHtml,
    ctaButton: {
      label: "Track Submission Status",
      url: data.trackUrl,
    },
    footerNote:
      "Save your tracking reference for future correspondence with the editorial board.",
  });

  const text = `Dear ${data.authorName},

Thank you for submitting your work to BBST Magazine. Your article has been received by our editorial desk.

Article Title: ${data.articleTitle}
Tracking Reference: ${data.submissionRef}

What happens next:
Our editorial board will evaluate your piece. You will receive an automated email as soon as an editor completes the review.

Track your submission online:
${data.trackUrl}

BBST Magazine Editorial & Publishing`;

  return { subject, html, text };
}

/* =========================================================================
   2. Article Submission: Editor Alert
   ========================================================================= */

export interface SubmissionEditorAlertData {
  authorName: string;
  authorEmail: string;
  articleTitle: string;
  submissionRef: string;
  category?: string;
  reviewUrl: string;
}

export function renderArticleSubmissionEditorAlert(data: SubmissionEditorAlertData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `[Editorial Alert] New Article Submitted: "${data.articleTitle}" (${data.submissionRef})`;
  const contentHtml = `
    <p>A new article has been submitted to BBST Magazine and requires editorial evaluation.</p>

    <div style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;padding:18px 20px;margin:22px 0;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding-bottom:10px;font-size:12px;font-weight:600;color:#6B7280;">Title:</td>
          <td style="padding-bottom:10px;font-size:14px;font-weight:600;color:#111827;">${escapeHtml(data.articleTitle)}</td>
        </tr>
        <tr>
          <td style="padding-bottom:10px;font-size:12px;font-weight:600;color:#6B7280;">Author:</td>
          <td style="padding-bottom:10px;font-size:14px;color:#111827;">${escapeHtml(data.authorName)} (${escapeHtml(data.authorEmail)})</td>
        </tr>
        <tr>
          <td style="padding-bottom:10px;font-size:12px;font-weight:600;color:#6B7280;">Category:</td>
          <td style="padding-bottom:10px;font-size:14px;color:#111827;">${escapeHtml(data.category || "General")}</td>
        </tr>
        <tr>
          <td style="font-size:12px;font-weight:600;color:#6B7280;">Tracking Ref:</td>
          <td style="font-family:monospace;font-size:13px;font-weight:600;color:#00873D;">${escapeHtml(data.submissionRef)}</td>
        </tr>
      </table>
    </div>

    <p style="font-size:14px;color:#4B5563;">
      Please access the editorial submissions desk to review the manuscript, provide feedback, or approve it for upcoming editions.
    </p>
  `;

  const html = renderBaseHtmlLayout({
    preheader: `New article submission from ${data.authorName}: ${data.articleTitle}`,
    badge: "Editorial Desk Alert",
    title: "New Submission Pending Review",
    contentHtml,
    ctaButton: {
      label: "Review Submission in Dashboard",
      url: data.reviewUrl,
    },
    footerNote:
      "This is an automated operational alert for BBST Magazine Editors.",
  });

  const text = `New Submission Alert:

Article Title: ${data.articleTitle}
Author: ${data.authorName} (${data.authorEmail})
Category: ${data.category || "General"}
Reference: ${data.submissionRef}

Review Submission:
${data.reviewUrl}

BBST Magazine Operational Desk`;

  return { subject, html, text };
}

/* =========================================================================
   3. Article Status Update (Approved, Published, Revision, Rejected)
   ========================================================================= */

export interface ArticleStatusEmailData {
  authorName: string;
  articleTitle: string;
  submissionRef: string;
  status: "APPROVED" | "PUBLISHED" | "REVISION_REQUESTED" | "REJECTED";
  editorialFeedback?: string | null;
  rejectionReason?: string | null;
  actionUrl: string;
}

export function renderArticleStatusUpdateEmail(data: ArticleStatusEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  let statusBadge = "Status Update";
  let title = "Update on Your Article Submission";
  let statusColor = "#374151";
  let statusBorder = "#E5E7EB";
  let statusBg = "#F9FAFB";
  let ctaLabel = "View Article Status";

  let statusDescription = "";
  if (data.status === "APPROVED") {
    statusBadge = "Submission Approved";
    title = "Your Article Has Been Approved";
    statusColor = "#00873D";
    statusBorder = "#B8F3D1";
    statusBg = "#E6FBF0";
    statusDescription =
      "Great news! Your article has been reviewed and accepted by our editorial board. It is now scheduled for layout and upcoming publication.";
    ctaLabel = "Check Publishing Pipeline";
  } else if (data.status === "PUBLISHED") {
    statusBadge = "Article Published";
    title = "Your Article is Now Live on BBST";
    statusColor = "#00873D";
    statusBorder = "#B8F3D1";
    statusBg = "#E6FBF0";
    statusDescription =
      "Congratulations! Your article has been officially published and is now accessible to the global BBST readership.";
    ctaLabel = "Read Published Article";
  } else if (data.status === "REVISION_REQUESTED") {
    statusBadge = "Revisions Requested";
    title = "Editorial Revisions Requested";
    statusColor = "#B45309";
    statusBorder = "#FDE68A";
    statusBg = "#FFFBEB";
    statusDescription =
      "The editors have reviewed your submission and would like to proceed with your piece once a few edits or clarifications are made.";
    ctaLabel = "Review Feedback & Resubmit";
  } else if (data.status === "REJECTED") {
    statusBadge = "Editorial Decision";
    title = "Decision Regarding Your Submission";
    statusColor = "#B91C1C";
    statusBorder = "#FECACA";
    statusBg = "#FEF2F2";
    statusDescription =
      "Thank you for sharing your manuscript with BBST Magazine. After careful deliberation, our editorial board has decided not to proceed with this submission for publication.";
    ctaLabel = "View Submission Record";
  }

  const feedbackText = data.editorialFeedback || data.rejectionReason;
  const feedbackBlock = feedbackText
    ? `
      <div style="margin:20px 0;background-color:#F8FAFC;border:1px solid #E2E8F0;border-left:4px solid #64748B;border-radius:6px;padding:16px 18px;">
        <div style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">
          Editorial Notes &amp; Feedback:
        </div>
        <div style="font-size:14px;color:#1E293B;line-height:1.6;font-style:italic;">
          "${escapeHtml(feedbackText)}"
        </div>
      </div>
    `
    : "";

  const contentHtml = `
    <p>Dear ${escapeHtml(data.authorName)},</p>
    <p>${statusDescription}</p>

    <div style="background-color:${statusBg};border:1px solid ${statusBorder};border-radius:6px;padding:18px 20px;margin:20px 0;">
      <div style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Article</div>
      <div style="font-size:16px;font-weight:600;color:#111827;margin-bottom:10px;">${escapeHtml(data.articleTitle)}</div>
      
      <div style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Current Status</div>
      <div style="font-size:14px;font-weight:700;color:${statusColor};text-transform:uppercase;letter-spacing:0.04em;">
        ${data.status.replace("_", " ")}
      </div>
    </div>

    ${feedbackBlock}

    <p style="font-size:14px;color:#4B5563;">
      Reference ID: <code style="font-family:monospace;background:#F3F4F6;padding:2px 6px;border-radius:4px;">${escapeHtml(data.submissionRef)}</code>
    </p>
  `;

  const subject = `[${data.status.replace("_", " ")}] "${data.articleTitle}" — BBST Editorial`;

  const html = renderBaseHtmlLayout({
    preheader: `Update on your article "${data.articleTitle}": ${data.status.replace("_", " ")}`,
    badge: statusBadge,
    title,
    contentHtml,
    ctaButton: {
      label: ctaLabel,
      url: data.actionUrl,
    },
  });

  const text = `Dear ${data.authorName},

Update regarding your submission: "${data.articleTitle}"
Reference: ${data.submissionRef}
Status: ${data.status.replace("_", " ")}

${statusDescription}

${feedbackText ? `Editorial Feedback:\n${feedbackText}\n` : ""}

View submission online:
${data.actionUrl}

BBST Magazine Editorial & Publishing`;

  return { subject, html, text };
}

/* =========================================================================
   4. Contact Form: Forward to Editorial Desk
   ========================================================================= */

export interface ContactNotificationEditorData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

export function renderContactNotificationEditorEmail(data: ContactNotificationEditorData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `[Inquiry - ${data.category}] ${data.subject}`;
  const contentHtml = `
    <p>A new inquiry has been received via the BBST Magazine public contact desk.</p>

    <div style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;padding:18px 20px;margin:20px 0;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding-bottom:8px;font-size:12px;font-weight:600;color:#6B7280;width:100px;">From:</td>
          <td style="padding-bottom:8px;font-size:14px;font-weight:600;color:#111827;">${escapeHtml(data.name)} &lt;${escapeHtml(data.email)}&gt;</td>
        </tr>
        <tr>
          <td style="padding-bottom:8px;font-size:12px;font-weight:600;color:#6B7280;">Subject:</td>
          <td style="padding-bottom:8px;font-size:14px;color:#111827;">${escapeHtml(data.subject)}</td>
        </tr>
        <tr>
          <td style="font-size:12px;font-weight:600;color:#6B7280;">Department:</td>
          <td style="font-size:14px;color:#00873D;font-weight:600;">${escapeHtml(data.category)}</td>
        </tr>
      </table>
    </div>

    <div style="background-color:#FFFFFF;border:1px solid #E5E7EB;border-left:4px solid #171717;border-radius:6px;padding:18px 20px;margin:20px 0;">
      <div style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">
        Message Body
      </div>
      <div style="font-size:14px;line-height:1.7;color:#1F2937;white-space:pre-wrap;">${escapeHtml(data.message)}</div>
    </div>

    <p style="font-size:13px;color:#6B7280;">
      Tip: You can reply directly to this email to respond directly to ${escapeHtml(data.name)}.
    </p>
  `;

  const html = renderBaseHtmlLayout({
    preheader: `Inquiry from ${data.name}: ${data.subject}`,
    badge: "Public Desk Inquiry",
    title: "New Message Received",
    contentHtml,
    ctaButton: {
      label: `Reply to ${data.name}`,
      url: `mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent(`Re: ${data.subject}`)}`,
    },
  });

  const text = `New Contact Inquiry:

From: ${data.name} <${data.email}>
Category: ${data.category}
Subject: ${data.subject}

Message:
${data.message}

Reply to: ${data.email}`;

  return { subject, html, text };
}

/* =========================================================================
   5. Contact Form: Confirmation to Sender
   ========================================================================= */

export interface ContactConfirmationSenderData {
  name: string;
  subject: string;
  category: string;
}

export function renderContactConfirmationSenderEmail(data: ContactConfirmationSenderData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Message Received: "${data.subject}" — BBST Magazine`;
  const contentHtml = `
    <p>Dear ${escapeHtml(data.name)},</p>
    <p>Thank you for getting in touch with BBST Magazine. We have received your inquiry regarding <strong>"${escapeHtml(data.subject)}"</strong> (${escapeHtml(data.category)} department).</p>
    
    <p>Our editorial and administrative team reviews incoming correspondence on business days. If your inquiry requires a response, a team member will reach out to you shortly.</p>

    <div style="margin:24px 0;padding:14px 18px;background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;font-size:13px;color:#4B5563;">
      While you wait, discover our latest published articles, in-depth interviews, and digital magazine editions on the BBST portal.
    </div>
  `;

  const html = renderBaseHtmlLayout({
    preheader: `Thank you for contacting BBST Magazine. We have received your message.`,
    badge: "Inquiry Received",
    title: "Thank You for Contacting Us",
    contentHtml,
    ctaButton: {
      label: "Explore BBST Magazine",
      url: getAppBaseUrl(),
    },
  });

  const text = `Dear ${data.name},

Thank you for reaching out to BBST Magazine. We have received your inquiry regarding "${data.subject}".

Our team reviews incoming correspondence and will respond if appropriate.

BBST Magazine Editorial Desk
${getAppBaseUrl()}`;

  return { subject, html, text };
}

/* =========================================================================
   6. Password Recovery
   ========================================================================= */

export interface PasswordResetEmailData {
  resetUrl: string;
  expiresInMinutes: number;
}

export function renderPasswordResetEmail(data: PasswordResetEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Reset Your BBST Magazine Password`;
  const contentHtml = `
    <p>We received a request to reset the password for your administrative BBST Magazine account.</p>
    
    <p>Click the button below to establish a new password. For security reasons, this single-use link will expire in <strong>${data.expiresInMinutes} minutes</strong>.</p>

    <div style="margin:22px 0;padding:14px 18px;background-color:#FEF2F2;border:1px solid #FECACA;border-radius:6px;font-size:13px;color:#991B1B;">
      <strong>Security notice:</strong> If you did not make this request, you can safely disregard this email. Your password remains unchanged and secure.
    </div>
  `;

  const html = renderBaseHtmlLayout({
    preheader: `Password reset link for BBST Magazine (valid for ${data.expiresInMinutes} minutes)`,
    badge: "Security Alert",
    title: "Password Reset Request",
    contentHtml,
    ctaButton: {
      label: "Reset Your Password",
      url: data.resetUrl,
    },
    footerNote:
      "Never share this link with anyone. The BBST Magazine team will never ask for your password.",
  });

  const text = `BBST Magazine — Password Reset Request

We received a request to reset your password. Use the link below to set a new password:

${data.resetUrl}

This link is valid for ${data.expiresInMinutes} minutes. If you did not request this, please ignore this email.

BBST Magazine Security Team`;

  return { subject, html, text };
}

/* =========================================================================
   7. Magazine Issue Publication Alert
   ========================================================================= */

export interface MagazinePublishedEmailData {
  issueTitle: string;
  issueNumber: string;
  description?: string | null;
  coverImageUrl?: string | null;
  readUrl: string;
  downloadUrl?: string | null;
}

export function renderMagazinePublishedAlert(data: MagazinePublishedEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `New Edition Available: ${data.issueTitle} — BBST Magazine`;
  const coverHtml = data.coverImageUrl
    ? `
      <div style="text-align:center;margin:20px 0;">
        <img src="${escapeHtml(data.coverImageUrl)}" alt="${escapeHtml(data.issueTitle)}" style="max-width:240px;width:100%;height:auto;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.15);border:1px solid #E5E7EB;" />
      </div>
    `
    : "";

  const descHtml = data.description
    ? `<p style="font-size:14px;color:#4B5563;line-height:1.6;">${escapeHtml(data.description)}</p>`
    : "";

  const downloadLinkHtml = data.downloadUrl
    ? `<p style="margin-top:14px;font-size:13px;"><a href="${escapeHtml(data.downloadUrl)}" style="color:#00873D;text-decoration:underline;">Download PDF Edition &rarr;</a></p>`
    : "";

  const contentHtml = `
    <p>A new print and digital edition of BBST Magazine has just been released!</p>
    
    <div style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-left:4px solid #00E500;border-radius:6px;padding:16px 20px;margin:20px 0;">
      <div style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Edition Details</div>
      <div style="font-size:18px;font-weight:700;color:#111827;margin-bottom:4px;">${escapeHtml(data.issueTitle)}</div>
      <div style="font-size:13px;color:#4B5563;font-weight:500;">Issue: ${escapeHtml(data.issueNumber)}</div>
    </div>

    ${coverHtml}
    ${descHtml}
    ${downloadLinkHtml}
  `;

  const html = renderBaseHtmlLayout({
    preheader: `New edition released: ${data.issueTitle}`,
    badge: "New Issue Released",
    title: "Read the Latest BBST Edition",
    contentHtml,
    ctaButton: {
      label: "Read Online Now",
      url: data.readUrl,
    },
  });

  const text = `New Edition Released: ${data.issueTitle} (Issue ${data.issueNumber})

Read it online at:
${data.readUrl}

${data.downloadUrl ? `Download PDF:\n${data.downloadUrl}\n` : ""}

BBST Magazine Editorial & Publishing`;

  return { subject, html, text };
}

/* =========================================================================
   8. Administrative Diagnostic Test Email
   ========================================================================= */

export interface TestEmailData {
  recipient: string;
  timestamp: string;
  environment: string;
  notes?: string;
}

export function renderTestEmail(data: TestEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `[Test Verification] BBST Magazine Email System Ready`;
  const contentHtml = `
    <p>This is an automated verification email dispatched from the BBST Magazine publishing platform.</p>

    <div style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;padding:18px 20px;margin:20px 0;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding-bottom:8px;font-size:12px;font-weight:600;color:#6B7280;width:120px;">Recipient:</td>
          <td style="padding-bottom:8px;font-size:13px;font-weight:600;color:#111827;">${escapeHtml(data.recipient)}</td>
        </tr>
        <tr>
          <td style="padding-bottom:8px;font-size:12px;font-weight:600;color:#6B7280;">Timestamp:</td>
          <td style="padding-bottom:8px;font-size:13px;color:#111827;">${escapeHtml(data.timestamp)}</td>
        </tr>
        <tr>
          <td style="padding-bottom:8px;font-size:12px;font-weight:600;color:#6B7280;">Environment:</td>
          <td style="padding-bottom:8px;font-size:13px;color:#00873D;font-weight:600;">${escapeHtml(data.environment)}</td>
        </tr>
        ${
          data.notes
            ? `
        <tr>
          <td style="font-size:12px;font-weight:600;color:#6B7280;">Notes:</td>
          <td style="font-size:13px;color:#374151;">${escapeHtml(data.notes)}</td>
        </tr>
        `
            : ""
        }
      </table>
    </div>

    <p style="font-size:14px;color:#4B5563;">
      If you are receiving this message in your inbox, your Gmail SMTP parameters, TLS transport security, and template rendering engine are functioning correctly.
    </p>
  `;

  const html = renderBaseHtmlLayout({
    preheader: `Test diagnostic verification email for ${data.recipient}`,
    badge: "SMTP Diagnostic",
    title: "Email System Verification",
    contentHtml,
    ctaButton: {
      label: "Open Editorial Dashboard",
      url: `${getAppBaseUrl()}/admin/editorial`,
    },
    footerNote:
      "This diagnostic message was triggered by an authorized administrator.",
  });

  const text = `BBST Magazine Email Diagnostic

Recipient: ${data.recipient}
Timestamp: ${data.timestamp}
Environment: ${data.environment}
${data.notes ? `Notes: ${data.notes}\n` : ""}

SMTP delivery and template engine are operating normally.

BBST Magazine System Operations`;

  return { subject, html, text };
}
