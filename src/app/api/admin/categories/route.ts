import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().trim().optional().nullable(),
  iconName: z.string().trim().optional().nullable(),
  coverImage: z.string().optional().nullable(),
});

// GET /api/admin/categories - List categories with article counts
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        iconName: c.iconName,
        coverImage: c.coverImage,
        articleCount: c._count.articles,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error("[Categories API] Error:", error);
    return NextResponse.json({ error: "Failed to load categories." }, { status: 500 });
  }
}

// POST /api/admin/categories - Create category (Admin only)
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    const { name, slug, description, iconName, coverImage } = parsed.data;

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ slug }, { name: { equals: name, mode: "insensitive" } }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A category with this name or slug already exists." },
        { status: 409 }
      );
    }

    const created = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        iconName: iconName || null,
        coverImage: coverImage || null,
      },
    });

    await prisma.editorialActivity.create({
      data: {
        action: "CATEGORY_CREATED",
        entityType: "CATEGORY",
        entityId: created.id,
        entityTitle: created.name,
        performedBy: session.username || "editor",
        details: `Created new category ${created.name} (${created.slug})`,
      },
    }).catch(() => null);

    revalidatePath("/categories");
    revalidatePath("/articles");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: "Category created successfully.",
      category: created,
    });
  } catch (error) {
    console.error("[Categories API] Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category." }, { status: 500 });
  }
}
