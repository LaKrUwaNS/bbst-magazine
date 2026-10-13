import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const instant = false;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  const whereClause: Prisma.ArticleWhereInput = { status: "published" };
  if (category) {
    whereClause.category = { slug: category };
  }
  if (q) {
    whereClause.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }

  const articles = await prisma.article.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4 sm:px-6">
      <h1 className="text-3xl font-bold border-b border-gray-200 pb-2">Articles</h1>
      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
        {category && (
          <p className="bg-gray-100 px-3 py-1 rounded-full">Category: <span className="font-semibold text-gray-900">{category}</span></p>
        )}
        {q && (
          <p className="bg-emerald-50 text-emerald-900 px-3 py-1 rounded-full border border-emerald-200">Search results for: <span className="font-semibold text-[#171717]">&ldquo;{q}&rdquo;</span></p>
        )}
      </div>

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
