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
          if (json.articles && json.articles.length > 0) {
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
    const pool = MOCK_ARTICLES.filter(
      (a) => a.slug.toLowerCase() !== currentSlug.toLowerCase(),
    );

    // Prefer same category if available
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
    return [...MOCK_ARTICLES]
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime(),
      )
      .slice(0, limit);
  }

  async getCategories(): Promise<CategoryWithCount[]> {
    return MOCK_CATEGORIES;
  }

  async getPopularTags(): Promise<string[]> {
    return MOCK_POPULAR_TAGS;
  }
}

// Default singleton instance
export const articleRepository: ArticleRepository = new MockArticleRepository();
