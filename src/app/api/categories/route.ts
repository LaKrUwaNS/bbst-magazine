import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORY_METADATA, FALLBACK_CATEGORIES } from "@/data/categories.data";

interface DbCategoryWithArticleCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconName: string | null;
  coverImage: string | null;
  _count: {
    articles: number;
  };
}

// GET /api/categories - Public categories listing with accurate article counts
export async function GET() {
  try {
    const dbCategories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            articles: {
              where: {
                status: { in: ["PUBLISHED", "published"] },
              },
            },
          },
        },
      },
    });

    const categories = dbCategories.map((c: DbCategoryWithArticleCount) => {
      const meta = CATEGORY_METADATA[c.slug] || {
        description: "Explore articles, research papers, and student perspectives in this field.",
        iconName: "Folder",
        image: "/images/articles-campus-hero.png",
        isFeatured: false,
      };

      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || meta.description,
        iconName: c.iconName || meta.iconName,
        coverImage: c.coverImage || meta.image,
        image: c.coverImage || meta.image,
        articleCount: c._count.articles,
        count: c._count.articles,
        isFeatured: meta.isFeatured,
      };
    });

    return NextResponse.json({
      success: true,
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error("[Public Categories API] Database query failed or timed out, returning curated categories:", error);
    return NextResponse.json({
      success: true,
      categories: FALLBACK_CATEGORIES,
      total: FALLBACK_CATEGORIES.length,
    });
  }
}
