import {
  Article,
  ArticleFilter,
  CategoryWithCount,
} from "@/types/article";
import {
  MOCK_ARTICLES,
  MOCK_CATEGORIES,
  MOCK_POPULAR_TAGS,
} from "@/data/articles.mock";

export interface GetArticlesParams {
  filter?: ArticleFilter;
  category?: string;
  tag?: string;
  search?: string;
}

export interface ArticleRepository {
  getArticles(params?: GetArticlesParams): Promise<Article[]>;
  getArticleBySlug(slug: string): Promise<Article | null>;
  getRelatedArticles(
    currentSlug: string,
    categorySlug?: string,
    limit?: number,
  ): Promise<Article[]>;
  getLatestArticles(limit?: number): Promise<Article[]>;
  getCategories(): Promise<CategoryWithCount[]>;
  getPopularTags(): Promise<string[]>;
}

/**
 * MockArticleRepository
 * 
 * Provides typed, asynchronous data access backed by local sample data.
 * When the backend API or Prisma models are ready, the backend developer
 * can create a `PrismaArticleRepository` or `ApiArticleRepository` that
 * satisfies this exact `ArticleRepository` contract.
 */
export class MockArticleRepository implements ArticleRepository {
  async getArticles(params?: GetArticlesParams): Promise<Article[]> {
    // In browser, attempt to fetch live published articles from PostgreSQL
    if (typeof window !== "undefined") {
      try {
        const queryParams = new URLSearchParams();
        if (params?.filter) queryParams.set("filter", params.filter);
        if (params?.category) queryParams.set("category", params.category);
        if (params?.tag) queryParams.set("tag", params.tag);
        if (params?.search) queryParams.set("q", params.search);

        const res = await fetch(`/api/articles?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.articles)) {
            return json.articles as Article[];
          }
        }
      } catch (err) {
        console.warn("[ArticleRepository] Live fetch fallback to mock data:", err);
      }
    }

    let result = [...MOCK_ARTICLES];

    // Filter by tab filter
    if (params?.filter) {
      switch (params.filter) {
        case "latest":
          result.sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() -
              new Date(a.publishedAt).getTime(),
          );
          break;
        case "trending":
          result = result.filter((a) => a.isTrending);
          result.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
          break;
        case "editors-picks":
          result = result.filter((a) => a.isEditorPick);
          break;
        case "most-read":
          result.sort((a, b) => (b.readCount || 0) - (a.readCount || 0));
          break;
        case "all":
        default:
          break;
      }
    }

    // Filter by category slug
    if (params?.category) {
      result = result.filter(
        (a) => a.category.slug.toLowerCase() === params.category?.toLowerCase(),
      );
    }

    // Filter by tag
    if (params?.tag) {
      result = result.filter((a) =>
        a.tags.some(
          (t) => t.toLowerCase() === params.tag?.toLowerCase(),
        ),
      );
    }

    // Search query
    if (params?.search) {
      const query = params.search.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.excerpt.toLowerCase().includes(query) ||
          a.author.name.toLowerCase().includes(query) ||
          a.category.name.toLowerCase().includes(query) ||
          a.tags.some((t) => t.toLowerCase().includes(query)),
      );
    }

    return result;
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/articles`);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.articles)) {
            const found = (json.articles as Article[]).find(
              (a) => a.slug.toLowerCase() === slug.toLowerCase()
            );
            if (found) return found;
          }
        }
      } catch (err) {
        console.warn("[ArticleRepository] Error fetching article by slug:", err);
      }
    }

    const article = MOCK_ARTICLES.find(
      (a) => a.slug.toLowerCase() === slug.toLowerCase(),
    );
    return article || null;
  }

  async getRelatedArticles(
    currentSlug: string,
    categorySlug?: string,
    limit: number = 3,
  ): Promise<Article[]> {
    if (typeof window !== "undefined") {
      try {
        const query = categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : "";
        const res = await fetch(`/api/articles${query}`);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.articles)) {
            const filtered = (json.articles as Article[]).filter(
              (a) => a.slug.toLowerCase() !== currentSlug.toLowerCase()
            );
            if (filtered.length > 0) {
              return filtered.slice(0, limit);
            }
          }
        }
      } catch (err) {
        console.warn("[ArticleRepository] Error fetching related articles:", err);
      }
    }

    const pool = MOCK_ARTICLES.filter(
      (a) => a.slug.toLowerCase() !== currentSlug.toLowerCase(),
    );

    let related = categorySlug
      ? pool.filter((a) => a.category.slug === categorySlug)
      : [];

    if (related.length < limit) {
      const rest = pool.filter((a) => !related.some((r) => r.id === a.id));
      related = [...related, ...rest];
    }

    return related.slice(0, limit);
  }

  async getLatestArticles(limit: number = 4): Promise<Article[]> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/articles?filter=latest");
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.articles) && json.articles.length > 0) {
            return (json.articles as Article[]).slice(0, limit);
          }
        }
      } catch (err) {
        console.warn("[ArticleRepository] Error fetching latest articles:", err);
      }
    }

    return [...MOCK_ARTICLES]
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime(),
      )
      .slice(0, limit);
  }

  async getCategories(): Promise<CategoryWithCount[]> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.categories) && json.categories.length > 0) {
            return json.categories.map(
              (c: { id: string; name: string; slug: string; iconName?: string; articleCount?: number; count?: number }) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                iconName: c.iconName || "Folder",
                count: c.articleCount ?? c.count ?? 0,
              })
            );
          }
        }
      } catch (err) {
        console.warn("[ArticleRepository] Error fetching live categories:", err);
      }
    }

    return MOCK_CATEGORIES;
  }

  async getPopularTags(): Promise<string[]> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/articles");
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.articles)) {
            const tagsSet = new Set<string>();
            json.articles.forEach((a: Article) => {
              if (Array.isArray(a.tags)) {
                a.tags.forEach((t) => {
                  if (t && t.trim()) tagsSet.add(t.trim());
                });
              }
            });
            if (tagsSet.size > 0) {
              return Array.from(tagsSet).slice(0, 8);
            }
          }
        }
      } catch (err) {
        console.warn("[ArticleRepository] Error fetching popular tags:", err);
      }
    }

    return MOCK_POPULAR_TAGS;
  }
}

// Default singleton instance
export const articleRepository: ArticleRepository = new MockArticleRepository();
