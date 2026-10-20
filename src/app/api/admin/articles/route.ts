import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createEditorArticle } from "@/lib/editorial/editorial-service";
import { sanitizeHtml } from "@/lib/sanitize";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createEditorArticleSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  slug: z.string().trim().optional(),
  excerpt: z.string().trim().optional(),
  content: z.string().trim().min(20, "Content must be provided"),
  authorName: z.string().trim().min(2, "Author name is required"),
  authorEmail: z.string().trim().email("Valid email required").optional().or(z.literal("")),
  authorDept: z.string().trim().optional(),
  categoryId: z.string().optional(),
  coverImage: z.string().optional(),
  coverImagePublicId: z.string().optional(),
  tags: z.string().optional(),
  status: z
    .enum([
      "DRAFT",
      "APPROVED",
      "PUBLISHED",
      "SUBMITTED",
      "UNDER_REVIEW",
      "REVISION_REQUESTED",
      "REJECTED",
    ])
    .default("DRAFT"),
  isFeatured: z.boolean().optional(),
  submissionSource: z.string().trim().optional(),
  editorialNotes: z.string().trim().optional(),
});

// GET /api/admin/articles - List all articles
export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const category = searchParams.get("category") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(5, parseInt(searchParams.get("pageSize") || "20", 10)));

    const where: Record<string, unknown> = {};

    if (status !== "all") {
      if (status === "PUBLISHED") {
        where.status = { in: ["PUBLISHED", "published"] };
      } else if (status === "DRAFT") {
        where.status = { in: ["DRAFT", "draft"] };
      } else {
        where.status = status;
      }
    }

    if (category !== "all") {
      where.categoryId = category;
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { authorName: { contains: query, mode: "insensitive" } },
        { authorEmail: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
      ];
    }

    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { name: true, email: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      success: true,
      articles,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error) {
    console.error("[Admin Articles API] Error listing articles:", error);
    return NextResponse.json(
      { error: "Failed to retrieve articles list." },
      { status: 500 }
    );
  }
}

// POST /api/admin/articles - Workflow B: Create article on behalf of a writer or directly
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = createEditorArticleSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    const data = parsed.data;
    const cleanContent = sanitizeHtml(data.content);

    const article = await createEditorArticle(
      {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: cleanContent,
        authorName: data.authorName,
        authorEmail: data.authorEmail || undefined,
        authorDept: data.authorDept,
        categoryId: data.categoryId,
        coverImage: data.coverImage,
        coverImagePublicId: data.coverImagePublicId,
        tags: data.tags,
        status: data.status,
        isFeatured: data.isFeatured,
        submissionSource: data.submissionSource,
        editorialNotes: data.editorialNotes,
      },
      session.username || "editor@bbst.uwu.ac.lk"
    );

    revalidatePath("/articles");
    revalidatePath(`/articles/${article.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: "Article created successfully.",
      article,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to create article.";
    console.error("[Admin Articles API] Error creating article:", error);
    return NextResponse.json({ error: errMessage }, { status: 400 });
  }
}
