import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export type ArticleWorkflowStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "REVISION_REQUESTED"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"
  | "DRAFT";

export interface SubmitArticleInput {
  title: string;
  excerpt?: string;
  content: string;
  authorName: string;
  authorEmail: string;
  authorDept?: string;
  categoryId?: string;
  coverImage?: string;
  coverImagePublicId?: string;
  tags?: string;
}

export interface EditorCreateArticleInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  authorDept?: string;
  categoryId?: string;
  coverImage?: string;
  coverImagePublicId?: string;
  tags?: string;
  status?: ArticleWorkflowStatus;
  isFeatured?: boolean;
  submissionSource?: string;
  editorialNotes?: string;
}

export interface ReviewActionInput {
  articleId: string;
  editorName: string;
  action: "APPROVE" | "PUBLISH" | "UNPUBLISH" | "REQUEST_REVISION" | "REJECT" | "MOVE_TO_REVIEW";
  feedback?: string;
  reason?: string;
}

/**
 * Normalizes title into a clean URL-friendly slug
 */
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
  return `${base}-${crypto.randomBytes(3).toString("hex")}`;
}

/**
 * Generates an immutable, human-friendly tracking reference for public submissions
 */
export function generateSubmissionRef(): string {
  const code = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `BBST-SUB-${code}`;
}

/**
 * Records an immutable editorial activity log
 */
export async function logEditorialActivity(
  action: string,
  entityType: "ARTICLE" | "MAGAZINE" | "CATEGORY",
  entityId: string,
  entityTitle: string,
  performedBy: string,
  details?: string
) {
  try {
    return await prisma.editorialActivity.create({
      data: {
        action,
        entityType,
        entityId,
        entityTitle,
        performedBy,
        details,
      },
    });
  } catch (err) {
    console.error("[EditorialActivity] Failed to write log:", err);
    return null;
  }
}

/**
 * Workflow A: Public writers submit an article for review
 */
export async function submitArticle(input: SubmitArticleInput) {
  const slug = generateSlug(input.title);
  const submissionRef = generateSubmissionRef();

  const article = await prisma.article.create({
    data: {
      title: input.title.trim(),
      slug,
      excerpt: input.excerpt?.trim() || null,
      content: input.content,
      coverImage: input.coverImage || null,
      coverImagePublicId: input.coverImagePublicId || null,
      status: "SUBMITTED",
      authorName: input.authorName.trim(),
      authorEmail: input.authorEmail.trim().toLowerCase(),
      authorDept: input.authorDept?.trim() || null,
      categoryId: input.categoryId || null,
      tags: input.tags || null,
      submissionRef,
      submissionSource: "Web Submission",
      submittedAt: new Date(),
    },
    include: {
      category: true,
    },
  });

  await logEditorialActivity(
    "ARTICLE_SUBMITTED",
    "ARTICLE",
    article.id,
    article.title,
    input.authorName,
    `Submitted from public portal. Reference: ${submissionRef}`
  );

  return article;
}

/**
 * Workflow B: Editors add an article on behalf of a writer or directly
 */
export async function createEditorArticle(
  input: EditorCreateArticleInput,
  editorName: string
) {
  const rawSlug = input.slug?.trim() || generateSlug(input.title);
  const status: ArticleWorkflowStatus = input.status || "DRAFT";

  // Check unique slug
  let slug = rawSlug;
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) {
    slug = `${rawSlug}-${crypto.randomBytes(2).toString("hex")}`;
  }

  const isPublished = status === "PUBLISHED";

  const article = await prisma.article.create({
    data: {
      title: input.title.trim(),
      slug,
      excerpt: input.excerpt?.trim() || null,
      content: input.content,
      coverImage: input.coverImage || null,
      coverImagePublicId: input.coverImagePublicId || null,
      status,
      authorName: input.authorName.trim(),
      authorEmail: input.authorEmail?.trim().toLowerCase() || null,
      authorDept: input.authorDept?.trim() || null,
      categoryId: input.categoryId || null,
      tags: input.tags || null,
      isFeatured: Boolean(input.isFeatured),
      enteredByEditor: true,
      submissionSource: input.submissionSource || "Direct Editor Entry",
      editorialNotes: input.editorialNotes?.trim() || null,
      reviewedBy: editorName,
      reviewedAt: isPublished ? new Date() : null,
      publishedAt: isPublished ? new Date() : null,
    },
    include: {
      category: true,
    },
  });

  await logEditorialActivity(
    isPublished ? "ARTICLE_PUBLISHED" : "ARTICLE_CREATED",
    "ARTICLE",
    article.id,
    article.title,
    editorName,
    `Entered by editor on behalf of ${input.authorName}. Status: ${status}`
  );

  return article;
}

/**
 * Workflow C: Review actions taken by editors (Approve, Publish, Request Revisions, Reject)
 */
export async function executeReviewAction(input: ReviewActionInput) {
  const current = await prisma.article.findUnique({
    where: { id: input.articleId },
    include: { category: true },
  });

  if (!current) {
    throw new Error("Article not found.");
  }

  // Create revision snapshot before consequential state mutations
  if (["REQUEST_REVISION", "REJECT", "PUBLISH"].includes(input.action)) {
    await prisma.articleRevision.create({
      data: {
        articleId: current.id,
        title: current.title,
        excerpt: current.excerpt,
        content: current.content,
        coverImage: current.coverImage,
        feedback: input.feedback || input.reason || null,
        status: current.status,
        createdById: input.editorName,
      },
    });
  }

  let updatedStatus: ArticleWorkflowStatus = current.status as ArticleWorkflowStatus;
  let publishedAt = current.publishedAt;
  let editorialFeedback = current.editorialFeedback;
  let rejectionReason = current.rejectionReason;

  switch (input.action) {
    case "MOVE_TO_REVIEW":
      updatedStatus = "UNDER_REVIEW";
      break;
    case "APPROVE":
      updatedStatus = "APPROVED";
      break;
    case "PUBLISH":
      updatedStatus = "PUBLISHED";
      publishedAt = publishedAt || new Date();
      break;
    case "UNPUBLISH":
      updatedStatus = "DRAFT";
      break;
    case "REQUEST_REVISION":
      if (!input.feedback?.trim()) {
        throw new Error("Editorial feedback is required when requesting revisions.");
      }
      updatedStatus = "REVISION_REQUESTED";
      editorialFeedback = input.feedback.trim();
      break;
    case "REJECT":
      updatedStatus = "REJECTED";
      rejectionReason = input.reason?.trim() || "Does not meet publication criteria at this time.";
      break;
  }

  const updated = await prisma.article.update({
    where: { id: input.articleId },
    data: {
      status: updatedStatus,
      publishedAt,
      editorialFeedback,
      rejectionReason,
      reviewedBy: input.editorName,
      reviewedAt: new Date(),
    },
    include: { category: true, revisions: { orderBy: { createdAt: "desc" } } },
  });

  await logEditorialActivity(
    `ARTICLE_${input.action}`,
    "ARTICLE",
    updated.id,
    updated.title,
    input.editorName,
    input.feedback || input.reason || `Status updated to ${updatedStatus}`
  );

  return updated;
}

/**
 * Resubmitting a revised article by a writer using their submissionRef
 */
export async function resubmitArticle(
  submissionRef: string,
  data: {
    title: string;
    excerpt?: string;
    content: string;
    coverImage?: string;
    coverImagePublicId?: string;
  }
) {
  const current = await prisma.article.findUnique({
    where: { submissionRef },
  });

  if (!current) {
    throw new Error("Submission reference not found.");
  }

  // Preserve previous version in revision table
  await prisma.articleRevision.create({
    data: {
      articleId: current.id,
      title: current.title,
      excerpt: current.excerpt,
      content: current.content,
      coverImage: current.coverImage,
      feedback: current.editorialFeedback,
      status: current.status,
      createdById: current.authorName || "Writer Resubmission",
    },
  });

  const updated = await prisma.article.update({
    where: { id: current.id },
    data: {
      title: data.title.trim(),
      excerpt: data.excerpt?.trim() || null,
      content: data.content,
      coverImage: data.coverImage || current.coverImage,
      coverImagePublicId: data.coverImagePublicId || current.coverImagePublicId,
      status: "SUBMITTED", // Returns to review queue
      submittedAt: new Date(),
    },
  });

  await logEditorialActivity(
    "ARTICLE_RESUBMITTED",
    "ARTICLE",
    updated.id,
    updated.title,
    current.authorName || "Writer",
    `Resubmitted revised draft for reference ${submissionRef}`
  );

  return updated;
}

/**
 * Fetches dashboard statistics derived from real database records
 */
export async function getEditorialDashboardStats() {
  const [
    totalSubmissions,
    pendingReviews,
    awaitingRevisions,
    publishedArticles,
    draftArticles,
    publishedMagazines,
    recentActivity,
    recentSubmissions,
  ] = await Promise.all([
    // Total submissions (all submitted articles)
    prisma.article.count({
      where: {
        status: { in: ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "APPROVED"] },
      },
    }),
    // Pending review queue
    prisma.article.count({
      where: {
        status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
      },
    }),
    // Revisions requested
    prisma.article.count({
      where: { status: "REVISION_REQUESTED" },
    }),
    // Published articles
    prisma.article.count({
      where: { status: { in: ["PUBLISHED", "published"] } },
    }),
    // Draft articles
    prisma.article.count({
      where: { status: { in: ["DRAFT", "draft"] } },
    }),
    // Published magazines
    prisma.magazineIssue.count({
      where: { status: { in: ["published", "PUBLISHED"] } },
    }),
    // Recent activity log
    prisma.editorialActivity.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    // Recent articles
    prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true },
    }),
  ]);

  return {
    totalSubmissions,
    pendingReviews,
    awaitingRevisions,
    publishedArticles,
    draftArticles,
    publishedMagazines,
    recentActivity,
    recentSubmissions,
  };
}
