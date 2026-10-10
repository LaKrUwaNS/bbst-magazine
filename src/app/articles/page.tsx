import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const instant = false;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const whereClause: Prisma.ArticleWhereInput = { status: "published" };
  if (category) {
    whereClause.category = { slug: category };
  }

  const articles = await prisma.article.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold border-b border-gray-200 pb-2">Articles</h1>
      {category && (
        <p className="text-gray-600">Showing articles in category: {category}</p>
      )}

      {articles.length > 0 ? (
        <ul className="space-y-6">
          {articles.map((article) => (
            <li key={article.id} className="border border-gray-200 p-4 rounded-md">
              <h2 className="text-xl font-bold mb-2">
                <Link href={`/articles/${article.slug}`} className="hover:underline">
                  {article.title}
                </Link>
              </h2>
              <div className="text-sm text-gray-500 mb-2 flex gap-4">
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                {article.category && (
                  <span>
                    Category:{" "}
                    <Link href={`/articles?category=${article.category.slug}`} className="hover:underline">
                      {article.category.name}
                    </Link>
                  </span>
                )}
              </div>
              {article.excerpt && <p className="text-gray-700">{article.excerpt}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No articles found.</p>
      )}
    </div>
  );
}
