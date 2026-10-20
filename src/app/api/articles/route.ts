import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      },
      orderBy,
    });

    const articles = dbArticles.map((a) => {
      const authorName = a.authorName || a.author?.name || "BBST Contributor";
      const authorEmail = a.author?.email || a.authorEmail || undefined;
      const authorDept = a.authorDept || "Uva Wellassa University";
      const tagsList = a.tags ? a.tags.split(",").map((t) => t.trim()).filter(Boolean) : ["Campus", "BBST"];

      // Generate structured sections for detail modal reader if content has paragraphs
      const paragraphs = (a.content || "")
        .replace(/<[^>]*>/g, "\n")
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

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
          id: a.authorId || a.id,
          name: authorName,
          department: authorDept,
          avatar: a.author?.image || "/images/avatar1.jpg",
          bio: `${authorName} is an active student researcher and contributor to BBST Magazine.`,
          email: authorEmail,
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
  } catch (error) {
    console.error("[Public Articles API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch articles." }, { status: 500 });
  }
}
