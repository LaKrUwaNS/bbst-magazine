import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function Home() {
  const recentArticles = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const latestMagazine = await prisma.magazineIssue.findFirst({
    where: { status: "published" },
    orderBy: { publicationDate: "desc" },
  });

  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">BBST Magazine</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Welcome to BBST Magazine. The leading source for insightful articles, exclusive interviews, and the latest trends.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">Latest Magazine Issue</h2>
        {latestMagazine ? (
          <div className="border border-gray-200 p-4 rounded-md">
            <h3 className="font-bold text-xl mb-2">
              <Link href={`/magazines/${latestMagazine.slug}`} className="hover:underline">
                {latestMagazine.title}
              </Link>
            </h3>
            {latestMagazine.publicationDate && (
              <p className="text-sm text-gray-500 mb-2">
                Published on: {new Date(latestMagazine.publicationDate).toLocaleDateString()}
              </p>
            )}
            {latestMagazine.description && (
              <p className="text-gray-700">{latestMagazine.description}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">No magazine issues published yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">Recent Articles</h2>
        {recentArticles.length > 0 ? (
          <ul className="space-y-4">
            {recentArticles.map((article) => (
              <li key={article.id} className="border border-gray-200 p-4 rounded-md">
                <h3 className="font-bold text-lg">
                  <Link href={`/articles/${article.slug}`} className="hover:underline">
                    {article.title}
                  </Link>
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(article.createdAt).toLocaleDateString()}
                </p>
                {article.excerpt && <p className="text-gray-700">{article.excerpt}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No articles published yet.</p>
        )}
      </section>
    </div>
  );
}
