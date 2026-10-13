import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const instant = false;

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: { author: true, category: true },
  });

  if (!article || article.status !== "published") {
    notFound();
  }

  return (
    <article className="space-y-6">
      <h1 className="text-4xl font-bold">{article.title}</h1>
      <div className="text-sm text-gray-500 flex flex-wrap gap-4 border-b border-gray-200 pb-4">
        <span>By {article.author.name}</span>
        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
        {article.category && <span>Category: {article.category.name}</span>}
      </div>
      
      {article.coverImage && (
        <div className="my-6">
          <Image
            src={article.coverImage}
            alt={article.title}
            width={800}
            height={450}
            priority
            className="max-w-full h-auto rounded-md"
          />
        </div>
      )}

      {article.content ? (
        <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: article.content }} />
      ) : (
        <p className="text-gray-500 italic">No content available.</p>
      )}
    </article>
  );
}
