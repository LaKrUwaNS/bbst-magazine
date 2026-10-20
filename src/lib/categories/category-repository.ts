import { prisma } from "@/lib/prisma";
import {
  CategoryDetailItem,
  CategorySortOption,
} from "@/types/category";
import {
  CATEGORY_METADATA,
  FALLBACK_CATEGORIES,
} from "@/data/categories.data";

export interface GetCategoriesOptions {
  query?: string;
  sortBy?: CategorySortOption;
}

export class CategoryRepository {
  /**
   * Fetches all categories enriched with real article counts and editorial metadata.
   */
  async getCategories(options?: GetCategoriesOptions): Promise<CategoryDetailItem[]> {
    let items: CategoryDetailItem[] = [];

    try {
      const dbCategories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              articles: {
                where: { status: "published" },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });

      if (dbCategories.length > 0) {
        items = dbCategories.map((c) => {
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
            description: meta.description,
            iconName: meta.iconName,
            image: meta.image,
            articleCount: c._count.articles,
            isFeatured: meta.isFeatured,
          };
        });
      } else {
        items = [...FALLBACK_CATEGORIES];
      }
    } catch (error) {
      console.error("[CategoryRepository] Error querying database, falling back to curated categories:", error);
      items = [...FALLBACK_CATEGORIES];
    }

    // Apply Search Filter
    if (options?.query && options.query.trim()) {
      const q = options.query.toLowerCase().trim();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    // Apply Sorting
    if (options?.sortBy) {
      switch (options.sortBy) {
        case "articles":
          items.sort((a, b) => b.articleCount - a.articleCount);
          break;
        case "name-asc":
          items.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          items.sort((a, b) => b.name.localeCompare(a.name));
          break;
      }
    }

    return items;
  }

  /**
   * Returns featured categories for top showcase section.
   */
  async getFeaturedCategories(): Promise<CategoryDetailItem[]> {
    const all = await this.getCategories();
    return all.filter((c) => c.isFeatured);
  }
}

export const categoryRepository = new CategoryRepository();
