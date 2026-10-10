import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold border-b border-gray-200 pb-2">Categories</h1>

      {categories.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <li key={category.id}>
              <Link 
                href={`/articles?category=${category.slug}`}
                className="block p-6 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-center font-semibold text-lg"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No categories found.</p>
      )}
    </div>
  );
}
