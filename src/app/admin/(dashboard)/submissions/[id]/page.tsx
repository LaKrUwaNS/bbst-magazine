import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { ArticleRevision } from "@prisma/client";
import { ArticleReviewView } from "@/components/admin/article-review-view";

export const metadata: Metadata = {
  title: "Review Article Submission | BBST Magazine Admin",
};


export const instant = false;

export default async function SubmissionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      writer: { select: { id: true, name: true, slug: true, profileImageUrl: true } },
      revisions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!article) {
    notFound();
  }

  return (
    <ArticleReviewView
      initialArticle={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
        status: article.status,
        authorName: article.authorName,
        authorEmail: article.authorEmail,
        authorDept: article.authorDept,
        writerId: article.writerId,
        writer: article.writer,
        submissionRef: article.submissionRef,
        submissionSource: article.submissionSource,
        editorialFeedback: article.editorialFeedback,
        rejectionReason: article.rejectionReason,
        editorialNotes: article.editorialNotes,
        tags: article.tags,
        isFeatured: article.isFeatured,
        submittedAt: article.submittedAt ? article.submittedAt.toISOString() : null,
        reviewedAt: article.reviewedAt ? article.reviewedAt.toISOString() : null,
        reviewedBy: article.reviewedBy,
        publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
        category: article.category,
        revisions: article.revisions.map((r: ArticleRevision) => ({
          id: r.id,
          title: r.title,
          excerpt: r.excerpt,
          content: r.content,
          feedback: r.feedback,
          status: r.status,
          createdById: r.createdById,
          createdAt: r.createdAt.toISOString(),
        })),
      }}
    />
  );
}
