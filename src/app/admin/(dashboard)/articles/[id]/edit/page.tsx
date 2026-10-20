import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleEditorForm } from "@/components/admin/article-editor-form";

export const metadata: Metadata = {
  title: "Edit Article | BBST Magazine Admin",
};


export const instant = false;

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) {
    notFound();
  }

  return (
    <ArticleEditorForm
      initialData={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
        coverImagePublicId: article.coverImagePublicId,
        authorName: article.authorName,
        authorEmail: article.authorEmail,
        authorDept: article.authorDept,
        writerId: article.writerId,
        categoryId: article.categoryId,
        tags: article.tags,
        status: article.status,
        isFeatured: article.isFeatured,
        submissionSource: article.submissionSource,
        editorialNotes: article.editorialNotes,
      }}
    />
  );
}
