import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z.string().trim().min(2).optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().trim().optional().nullable(),
  iconName: z.string().trim().optional().nullable(),
  coverImage: z.string().optional().nullable(),
});

// PATCH /api/admin/categories/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.category.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    const data = parsed.data;

    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await prisma.category.findUnique({
        where: { slug: data.slug },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "Another category already uses this slug." },
          { status: 409 }
        );
      }
    }

    const updatePayload: Record<string, unknown> = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.slug !== undefined) updatePayload.slug = data.slug;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.iconName !== undefined) updatePayload.iconName = data.iconName;
    if (data.coverImage !== undefined) updatePayload.coverImage = data.coverImage;

    const updated = await prisma.category.update({
      where: { id },
      data: updatePayload,
    });

    await prisma.editorialActivity.create({
      data: {
        action: "CATEGORY_UPDATED",
        entityType: "CATEGORY",
        entityId: updated.id,
        entityTitle: updated.name,
        performedBy: session.username || "editor",
        details: `Updated category ${updated.name}`,
      },
    }).catch(() => null);

    revalidatePath("/categories");
    revalidatePath("/articles");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
      category: updated,
    });
  } catch (error) {
    console.error("[Categories API] Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category." }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id] - Safe deletion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    // Unassign articles safely (Prisma schema has onDelete: SetNull for categoryId)
    await prisma.category.delete({ where: { id } });

    await prisma.editorialActivity.create({
      data: {
        action: "CATEGORY_DELETED",
        entityType: "CATEGORY",
        entityId: existing.id,
        entityTitle: existing.name,
        performedBy: session.username || "editor",
        details: `Deleted category "${existing.name}". ${existing._count.articles} articles unassigned safely.`,
      },
    }).catch(() => null);

    revalidatePath("/categories");
    revalidatePath("/articles");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: `Category "${existing.name}" deleted successfully.`,
    });
  } catch (error) {
    console.error("[Categories API] Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category." }, { status: 500 });
  }
}
