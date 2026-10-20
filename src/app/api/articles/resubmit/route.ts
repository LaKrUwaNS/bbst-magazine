import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resubmitArticle } from "@/lib/editorial/editorial-service";
import { sanitizeHtml } from "@/lib/sanitize";

const resubmitSchema = z.object({
  submissionRef: z.string().trim().min(5, "Valid submission reference is required"),
  title: z.string().trim().min(5, "Title must be at least 5 characters"),
  excerpt: z.string().trim().nullish().transform((v) => v || undefined),
  content: z.string().trim().min(50, "Content must contain at least 50 characters"),
  coverImage: z.string().nullish().transform((v) => v || undefined),
  coverImagePublicId: z.string().nullish().transform((v) => v || undefined),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = resubmitSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    const data = parsed.data;
    const cleanContent = sanitizeHtml(data.content);

    const updated = await resubmitArticle(data.submissionRef, {
      title: data.title,
      excerpt: data.excerpt,
      content: cleanContent,
      coverImage: data.coverImage,
      coverImagePublicId: data.coverImagePublicId,
    });

    return NextResponse.json({
      success: true,
      message: "Revised submission received. Your article is back in the editorial review queue.",
      submissionRef: updated.submissionRef,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to resubmit revision.";
    console.error("[Article Resubmit API] Error:", error);
    return NextResponse.json({ error: errMessage }, { status: 400 });
  }
}
