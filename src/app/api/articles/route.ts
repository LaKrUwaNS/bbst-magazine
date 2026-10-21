import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_ARTICLES } from "@/data/articles.mock";

interface ArticleWithRelations {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  status: string;
  tags: string | null;
  authorName: string | null;
  authorEmail: string | null;
  authorDept: string | null;
  authorId: string | null;
  writerId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  category: { id: string; name: string; slug: string } | null;
  author: { id: string; name: string; email: string; image: string | null } | null;
  writer: {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    department: string | null;
    profileImageUrl: string | null;
    shortBio: string | null;
    bio: string | null;
    socialLinks: unknown;
  } | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const category = searchParams.get("category")?.trim();
    const tag = searchParams.get("tag")?.trim();
    const filter = searchParams.get("filter") || "all";

    const where: Record<string, unknown> = {
      status: { in: ["PUBLISHED", "published"] },
    };

    if (category) {
      where.category = { slug: { equals: category, mode: "insensitive" } };
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
        { authorName: { contains: query, mode: "insensitive" } },
        { writer: { name: { contains: query, mode: "insensitive" } } },
        { authorDept: { contains: query, mode: "insensitive" } },
        { tags: { contains: query, mode: "insensitive" } },
      ];
    }

    if (tag) {
      where.tags = { contains: tag, mode: "insensitive" };
    }

    let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
    if (filter === "latest") {
      orderBy = { createdAt: "desc" };
    }

    const dbArticles = await prisma.article.findMany({
      where,
      include: {
        category: true,
        author: true,
        writer: true,
      },
      orderBy,
    });

    const articles = dbArticles.map((a: ArticleWithRelations) => {
      const authorName = a.writer?.name || a.authorName || a.author?.name || "BBST Contributor";
      const authorEmail = a.writer?.email || a.author?.email || a.authorEmail || undefined;
      const authorDept = a.writer?.department || a.authorDept || "Uva Wellassa University";
      const authorAvatar = a.writer?.profileImageUrl || a.author?.image || "/images/avatar1.jpg";
      const authorBio =
        a.writer?.shortBio ||
        a.writer?.bio ||
        `${authorName} is an active student researcher and contributor to BBST Magazine.`;
      const authorSlug = a.writer?.slug || undefined;
      const authorSocials = (a.writer?.socialLinks as Record<string, string>) || {};
      const tagsList = a.tags ? a.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : ["Campus", "BBST"];

      // Generate structured sections for detail modal reader if content has paragraphs
      const paragraphs = (a.content || "")
        .replace(/<[^>]*>/g, "\n")
        .split("\n")
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0);

      return {
        id: a.id,
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt || "",
        coverImage: a.coverImage || "/images/Magazine.png",
        category: {
          id: a.category?.id || "general",
          name: a.category?.name || "General",
          slug: a.category?.slug || "general",
        },
        author: {
          id: a.writerId || a.authorId || a.id,
          name: authorName,
          slug: authorSlug,
          department: authorDept,
          avatar: authorAvatar,
          bio: authorBio,
          email: authorEmail,
          socials: authorSocials,
        },
        publishedAt: a.publishedAt
          ? new Date(a.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : new Date(a.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
        readTime: "5 min read",
        tags: tagsList,
        status: "published" as const,
        sections: [
          {
            id: `sec-${a.id}-1`,
            heading: a.title,
            content: paragraphs.length > 0 ? paragraphs : [a.excerpt || "No content provided."],
          },
        ],
      };
    });

    return NextResponse.json({
      success: true,
      articles,
      total: articles.length,
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      (error as { digest: string }).digest === "NEXT_PRERENDER_INTERRUPTED"
    ) {
      throw error;
    }
    console.error("[Public Articles API] Database query failed or timed out, returning fallback articles:", error);
    return NextResponse.json({
      success: true,
      articles: MOCK_ARTICLES,
      total: MOCK_ARTICLES.length,
    });
  }
}
