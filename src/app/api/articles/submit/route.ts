import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitArticle } from "@/lib/editorial/editorial-service";
import { sanitizeHtml } from "@/lib/sanitize";

// In-memory sliding window rate limiter for submissions
const submissionIpMap = new Map<string, { count: number; expiresAt: number }>();
const MAX_SUBMISSIONS_PER_HOUR = 6;
const WINDOW_MS = 60 * 60 * 1000;

function checkSubmissionRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = submissionIpMap.get(ip);

  if (!entry || now > entry.expiresAt) {
    submissionIpMap.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_SUBMISSIONS_PER_HOUR) {
    return false;
  }

  entry.count += 1;
  return true;
}

const submitArticleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title is too long"),
  excerpt: z.string().trim().max(500, "Excerpt is too long").nullish().transform((v) => v || undefined),
  content: z
    .string()
    .trim()
    .min(50, "Content must contain at least 50 characters"),
  authorName: z
    .string()
    .trim()
    .min(2, "Author name must be at least 2 characters")
    .max(100, "Name is too long"),
  authorEmail: z
    .string()
    .trim()
    .email("A valid email address is required for editorial correspondence"),
  authorDept: z.string().trim().max(100).nullish().transform((v) => v || undefined),
  categoryId: z.string().nullish().transform((v) => v || undefined),
  coverImage: z.string().nullish().transform((v) => v || undefined),
  coverImagePublicId: z.string().nullish().transform((v) => v || undefined),
  tags: z.string().nullish().transform((v) => v || undefined),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the BBST publication guidelines and terms",
  }),
});

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!checkSubmissionRateLimit(ip)) {
      return NextResponse.json(
        {
          error:
            "Too many submissions from this IP address. Please wait an hour before submitting again.",
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = submitArticleSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    const data = parsed.data;

    // Sanitize rich text content before persisting
    const cleanContent = sanitizeHtml(data.content);

    const article = await submitArticle({
      title: data.title,
      excerpt: data.excerpt,
      content: cleanContent,
      authorName: data.authorName,
      authorEmail: data.authorEmail,
      authorDept: data.authorDept,
      categoryId: data.categoryId,
      coverImage: data.coverImage,
      coverImagePublicId: data.coverImagePublicId,
      tags: data.tags,
    });

    return NextResponse.json({
      success: true,
      message: "Article submitted successfully for editorial review.",
      submissionRef: article.submissionRef,
      articleId: article.id,
      title: article.title,
    });
  } catch (error) {
    console.error("[Article Submit API] Error processing submission:", error);
    return NextResponse.json(
      { error: "Failed to submit article. Please try again." },
      { status: 500 }
    );
  }
}
