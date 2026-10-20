import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get("ref")?.trim();

    if (!ref) {
      return NextResponse.json(
        { error: "Submission reference is required." },
        { status: 400 }
      );
    }

    const article = await prisma.article.findUnique({
      where: { submissionRef: ref },
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "No submission found with this reference number. Please check the code." },
        { status: 404 }
      );
    }

    // Only expose author-facing safe fields
    return NextResponse.json({
      success: true,
      submission: {
        ref: article.submissionRef,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
        authorName: article.authorName,
        categoryName: article.category?.name || "General",
        status: article.status,
        submittedAt: article.submittedAt || article.createdAt,
        reviewedAt: article.reviewedAt,
        editorialFeedback:
          article.status === "REVISION_REQUESTED" ? article.editorialFeedback : null,
        rejectionReason:
          article.status === "REJECTED" ? article.rejectionReason : null,
        publishedAt: article.publishedAt,
        slug: article.status === "PUBLISHED" ? article.slug : null,
      },
    });
  } catch (error) {
    console.error("[Article Track API] Error tracking submission:", error);
    return NextResponse.json(
      { error: "Failed to retrieve submission details." },
      { status: 500 }
    );
  }
}
