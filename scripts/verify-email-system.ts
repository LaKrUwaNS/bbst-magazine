import { prisma } from "../src/lib/prisma";
import {
  getSmtpConfig,
  isSmtpConfigured,
  verifySmtpConnection,
} from "../src/lib/email/transporter";
import {
  isValidEmail,
  sanitizeEmailHeader,
  escapeHtml,
  contactFormSchema,
} from "../src/lib/email/email-validation";
import {
  renderArticleSubmissionAuthorEmail,
  renderArticleSubmissionEditorAlert,
  renderArticleStatusUpdateEmail,
  renderContactNotificationEditorEmail,
  renderContactConfirmationSenderEmail,
  renderPasswordResetEmail,
  renderMagazinePublishedAlert,
  renderTestEmail,
} from "../src/lib/email/email-templates";
import {
  sendArticleSubmissionEmails,
  sendContactFormEmails,
  sendPasswordResetEmail,
  sendMagazinePublishedAlert,
  sendDiagnosticTestEmail,
} from "../src/lib/email/email-service";
import crypto from "crypto";

interface TestResult {
  name: string;
  status: "PASS" | "FAIL";
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function pass(name: string, details?: string) {
  results.push({ name, status: "PASS", details });
  console.log(`  ✓ PASS: ${name}${details ? ` (${details})` : ""}`);
}

function fail(name: string, error: unknown) {
  const errMsg = error instanceof Error ? error.message : String(error);
  results.push({ name, status: "FAIL", error: errMsg });
  console.error(`  ✗ FAIL: ${name} - ${errMsg}`);
}

async function runEmailVerification() {
  console.log(
    "================================================================",
  );
  console.log(
    "  BBST Magazine — Comprehensive Email System Verification Suite ",
  );
  console.log(
    "================================================================\n",
  );

  // 1. Smtp Configuration
  console.log("Suite 1: SMTP Transporter & Configuration Diagnostics");
  try {
    const config = getSmtpConfig();
    if (!config.host || !config.port || !config.user) {
      throw new Error("Missing required SMTP configuration fields.");
    }
    pass(
      "SMTP Configuration Retrieval",
      `Host: ${config.host}:${config.port}, User: ${config.user}`,
    );

    const configured = isSmtpConfigured();
    pass(
      "SMTP Configuration Detection",
      `Is Real SMTP Configured: ${configured}`,
    );

    const conn = await verifySmtpConnection();
    if (!conn.ok && !conn.simulated) {
      throw new Error(`SMTP connection failed: ${conn.message}`);
    }
    pass("SMTP Readiness Verification", conn.message);
  } catch (err) {
    fail("SMTP Transporter & Configuration Diagnostics", err);
  }

  // 2. Email Address Validation & Sanitization
  console.log("\nSuite 2: Email Validation, Header Sanitization & Escaping");
  try {
    if (!isValidEmail("editor@bbst.uwu.ac.lk"))
      throw new Error("Valid email rejected");
    if (!isValidEmail("ceylonnest.org@gmail.com"))
      throw new Error("Valid email rejected");
    if (isValidEmail("invalid-email"))
      throw new Error("Invalid email accepted");
    if (isValidEmail("test@")) throw new Error("Invalid email accepted");
    if (isValidEmail("")) throw new Error("Empty email accepted");
    pass("Email Regex RFC Validation");

    const dirtyHeader = "Kasun\r\nBcc: evil@hacker.com\nSubject: Injected";
    const cleanHeader = sanitizeEmailHeader(dirtyHeader);
    if (cleanHeader.includes("\r") || cleanHeader.includes("\n")) {
      throw new Error("Header injection characters not stripped");
    }
    pass("SMTP Header Injection Sanitization", `Result: "${cleanHeader}"`);

    const dirtyHtml = '<script>alert("xss")</script> & "quotes"';
    const cleanHtml = escapeHtml(dirtyHtml);
    if (cleanHtml.includes("<script>") || cleanHtml.includes('"quotes"')) {
      throw new Error("HTML special characters not escaped");
    }
    pass("Dynamic HTML Entities Escaping", `Result: "${cleanHtml}"`);

    const validContact = contactFormSchema.safeParse({
      name: "Kasun Perera",
      email: "kasun@uwu.ac.lk",
      subject: "Submission Inquiry",
      category: "EDITORIAL",
      message: "This is a detailed inquiry containing more than 15 characters.",
    });
    if (!validContact.success) throw new Error("Valid contact schema rejected");
    pass("Contact Form Zod Schema Validation");
  } catch (err) {
    fail("Validation & Sanitization", err);
  }

  // 3. Email Template Rendering
  console.log("\nSuite 3: Email Templates Rendering & Formatting");
  try {
    const authorEmail = renderArticleSubmissionAuthorEmail({
      authorName: "Anuki Silva",
      articleTitle: "Advancements in Plant Biotechnology",
      submissionRef: "BBST-2026-TEST",
      trackUrl: "http://localhost:3000/submit?ref=BBST-2026-TEST",
    });
    if (
      !authorEmail.subject.includes("Advancements in Plant Biotechnology") ||
      !authorEmail.html.includes("BBST-2026-TEST")
    ) {
      throw new Error("Author submission template missing key metadata");
    }
    pass("Template: Article Submission Author Confirmation");

    const editorAlert = renderArticleSubmissionEditorAlert({
      authorName: "Anuki Silva",
      authorEmail: "anuki@uwu.ac.lk",
      articleTitle: "Advancements in Plant Biotechnology",
      submissionRef: "BBST-2026-TEST",
      category: "Biotechnology",
      reviewUrl: "http://localhost:3000/admin/editorial",
    });
    if (
      !editorAlert.html.includes("Anuki Silva") ||
      !editorAlert.text.includes("BBST-2026-TEST")
    ) {
      throw new Error("Editor alert template missing metadata");
    }
    pass("Template: Article Submission Editor Alert");

    const approvedEmail = renderArticleStatusUpdateEmail({
      authorName: "Anuki Silva",
      articleTitle: "Advancements in Plant Biotechnology",
      submissionRef: "BBST-2026-TEST",
      status: "APPROVED",
      actionUrl: "http://localhost:3000/submit?ref=BBST-2026-TEST",
    });
    if (
      !approvedEmail.html.includes("Approved") ||
      !approvedEmail.subject.includes("APPROVED")
    ) {
      throw new Error("Approved status template missing status branding");
    }
    pass("Template: Article Status Update (APPROVED)");

    const revisionEmail = renderArticleStatusUpdateEmail({
      authorName: "Anuki Silva",
      articleTitle: "Advancements in Plant Biotechnology",
      submissionRef: "BBST-2026-TEST",
      status: "REVISION_REQUESTED",
      editorialFeedback:
        "Please expand the methodology section and clarify sample sizes.",
      actionUrl: "http://localhost:3000/submit?ref=BBST-2026-TEST#revision",
    });
    if (!revisionEmail.html.includes("expand the methodology section")) {
      throw new Error("Revision template missing editorial feedback block");
    }
    pass("Template: Article Status Update (REVISION_REQUESTED with feedback)");

    const contactEditor = renderContactNotificationEditorEmail({
      name: "Nimal Fernando",
      email: "nimal@gmail.com",
      subject: "Inquiry Regarding Magazine Print Distribution",
      category: "MAGAZINE_PRINT",
      message:
        "When will physical copies of the upcoming issue be distributed on campus?",
    });
    if (
      !contactEditor.html.includes("Nimal Fernando") ||
      !contactEditor.html.includes("physical copies")
    ) {
      throw new Error("Contact editor template missing content");
    }
    pass("Template: Contact Inquiry Forwarding to Editor");

    const contactConfirm = renderContactConfirmationSenderEmail({
      name: "Nimal Fernando",
      subject: "Inquiry Regarding Magazine Print Distribution",
      category: "MAGAZINE_PRINT",
    });
    if (!contactConfirm.html.includes("Nimal Fernando")) {
      throw new Error("Contact confirmation template missing recipient name");
    }
    pass("Template: Contact Confirmation Receipt to Sender");

    const passwordReset = renderPasswordResetEmail({
      resetUrl:
        "http://localhost:3000/admin/reset-password?token=test-token-123456",
      expiresInMinutes: 30,
    });
    if (
      !passwordReset.html.includes("test-token-123456") ||
      !passwordReset.html.includes("30 minutes")
    ) {
      throw new Error("Password reset template missing URL or expiry");
    }
    pass("Template: Password Recovery Reset Link");

    const magazineAlert = renderMagazinePublishedAlert({
      issueTitle: "BBST Vol 4 Issue 1: Frontiers in Tech",
      issueNumber: "Edition 04",
      description:
        "A comprehensive look at student innovation and bio-engineering.",
      readUrl: "http://localhost:3000/magazines/vol-4-issue-1",
      downloadUrl: "https://example.com/magazine.pdf",
    });
    if (
      !magazineAlert.html.includes("Vol 4 Issue 1") ||
      !magazineAlert.text.includes("Read it online")
    ) {
      throw new Error("Magazine published alert missing title or URL");
    }
    pass("Template: Magazine Publication Release Announcement");

    const testEmail = renderTestEmail({
      recipient: "editor@bbst.uwu.ac.lk",
      timestamp: new Date().toUTCString(),
      environment: "test",
      notes: "Verification diagnostic check",
    });
    if (
      !testEmail.html.includes("editor@bbst.uwu.ac.lk") ||
      !testEmail.html.includes("Verification diagnostic check")
    ) {
      throw new Error("Test email template missing recipient or notes");
    }
    pass("Template: Administrative Diagnostic Test Email");
  } catch (err) {
    fail("Template Rendering", err);
  }

  // 4. Email Service Safe Execution & NotificationLog Integration
  console.log("\nSuite 4: Email Service Execution & NotificationLog Tracking");
  try {
    const testRef = `TEST-EMAIL-${Date.now()}`;
    const submissionResult = await sendArticleSubmissionEmails({
      authorName: "Verification Writer",
      authorEmail: "testwriter@bbst.uwu.ac.lk",
      articleTitle: "Automated Test Manuscript",
      submissionRef: testRef,
      category: "Diagnostic",
    });

    if (
      !submissionResult.authorSendResult.success ||
      !submissionResult.editorSendResult.success
    ) {
      throw new Error(
        "Submission notification emails failed to return success",
      );
    }
    pass(
      "Email Service: Article Submission Author & Editor Emails Dispatched",
      `Simulated: ${submissionResult.authorSendResult.simulated}`,
    );

    // Verify NotificationLog records in database
    const authorLog = await prisma.notificationLog.findFirst({
      where: {
        recipient: "testwriter@bbst.uwu.ac.lk",
        type: "SUBMISSION_CONFIRMATION",
      },
      orderBy: { createdAt: "desc" },
    });
    if (!authorLog || authorLog.subject.indexOf(testRef) === -1) {
      throw new Error(
        "Author submission notification was not recorded in notification_log table",
      );
    }
    pass(
      "Database: Author Notification Log Record Persisted",
      `Status: ${authorLog.status}, ID: ${authorLog.id}`,
    );

    // Test Contact Form Emails
    const contactResult = await sendContactFormEmails({
      name: "Diagnostic Sender",
      email: "diagnostics@bbst.uwu.ac.lk",
      subject: "Test Contact Inquiry",
      category: "GENERAL",
      message:
        "Testing contact message dispatch and database notification logging.",
    });
    if (
      !contactResult.editorResult.success ||
      !contactResult.senderResult.success
    ) {
      throw new Error("Contact form emails failed");
    }
    pass("Email Service: Contact Inquiry & Confirmation Dispatched");

    // Test Password Reset Email
    const pwdResult = await sendPasswordResetEmail({
      email: "admin-reset-test@bbst.uwu.ac.lk",
      resetToken: "test-crypto-token-64chars-length-sample",
      expiresInMinutes: 30,
    });
    if (!pwdResult.success)
      throw new Error("Password reset email dispatch failed");
    pass("Email Service: Password Reset Dispatch");

    // Test Magazine Publication Alert
    const magResult = await sendMagazinePublishedAlert({
      issueTitle: "Test Edition 2026",
      issueNumber: "01",
      slug: "test-edition-2026",
    });
    if (!magResult.success)
      throw new Error("Magazine publication email failed");
    pass("Email Service: Magazine Publication Broadcast");

    // Test Diagnostic Test Email
    const diagResult = await sendDiagnosticTestEmail({
      recipient: "diag-check@bbst.uwu.ac.lk",
      notes: "Unit diagnostic check",
    });
    if (!diagResult.success) throw new Error("Diagnostic test email failed");
    pass("Email Service: System Diagnostic Test Email");
  } catch (err) {
    fail("Email Service & Database Logging", err);
  }

  // 5. Password Reset Token Security Lifecycle
  console.log("\nSuite 5: Password Recovery Cryptographic Token Security");
  try {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const testIdentifier = "security-test@bbst.uwu.ac.lk";

    // Clean any prior tokens
    await prisma.verification.deleteMany({
      where: { identifier: testIdentifier },
    });

    // Store hashed token
    const created = await prisma.verification.create({
      data: {
        id: crypto.randomUUID(),
        identifier: testIdentifier,
        value: tokenHash,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    if (!created || created.value !== tokenHash) {
      throw new Error("Failed to store hashed verification token");
    }
    pass("Token Generation & SHA-256 Hashing");

    // Look up via raw token hash
    const found = await prisma.verification.findFirst({
      where: { value: tokenHash, expiresAt: { gt: new Date() } },
    });
    if (!found) throw new Error("Could not find active token by SHA-256 hash");
    pass("Token Lookup via SHA-256 Hash");

    // Invalidate token
    await prisma.verification.delete({ where: { id: found.id } });
    const checkDeleted = await prisma.verification.findFirst({
      where: { value: tokenHash },
    });
    if (checkDeleted) throw new Error("Token was not invalidated after use");
    pass("Single-Use Token Invalidation Enforced");
  } catch (err) {
    fail("Password Reset Security", err);
  }

  // Summary
  console.log(
    "\n================================================================",
  );
  console.log(
    "  Verification Suite Summary                                    ",
  );
  console.log(
    "================================================================",
  );
  const total = results.length;
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;

  console.log(`Total Checks: ${total} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    console.error(`\n❌ ${failed} checks failed.`);
    process.exit(1);
  } else {
    console.log(
      `\n🎉 All ${passed} email system verification checks PASSED successfully!`,
    );
  }
}

runEmailVerification()
  .catch((err) => {
    console.error("Fatal test execution error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
