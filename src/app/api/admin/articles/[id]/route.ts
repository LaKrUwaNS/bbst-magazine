import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/sanitize";
import { deleteAsset } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateArticleSchema = z.object({
  title: z.string().trim().min(3).optional(),
  slug: z.string().trim().optional().nullable(),
  excerpt: z.string().trim().optional().nullable(),
  content: z.string().trim().optional(),
  authorName: z.string().trim().optional(),
  authorEmail: z
    .string()
    .trim()
    .email()
    .optional()
    .nullable()
    .or(z.literal(""))
    .or(z.null()),
  authorDept: z.string().trim().optional().nullable(),
  writerId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  coverImagePublicId: z.string().optional().nullable(),
  tags: z
    .union([z.string(), z.array(z.string()).transform((arr) => arr.join(", "))])
    .optional()
    .nullable(),
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
    .optional(),
  isFeatured: z.boolean().optional(),
  editorialNotes: z.string().trim().optional().nullable(),
  submissionSource: z.string().trim().optional().nullable(),
});

// GET /api/admin/articles/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        writer: { select: { id: true, name: true, slug: true, profileImageUrl: true, department: true } },
        revisions: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error("[Admin Article API] Error retrieving article:", error);
    return NextResponse.json(
      { error: "Failed to retrieve article." },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/articles/[id] - Update article
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
    const existing = await prisma.article.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateArticleSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    const data = parsed.data;

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await prisma.article.findUnique({
        where: { slug: data.slug },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "An article with this slug already exists." },
          { status: 409 }
        );
      }
    }

    // Preserve revision if content is modified
    if (data.content && data.content !== existing.content) {
      await prisma.articleRevision.create({
        data: {
          articleId: existing.id,
          title: existing.title,
          excerpt: existing.excerpt,
          content: existing.content,
          coverImage: existing.coverImage,
          status: existing.status,
          createdById: session.username || "editor",
        },
      });
    }

    const updatePayload: Record<string, unknown> = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.slug !== undefined) updatePayload.slug = data.slug;
    if (data.excerpt !== undefined) updatePayload.excerpt = data.excerpt;
    if (data.content !== undefined) updatePayload.content = sanitizeHtml(data.content);
    if (data.authorName !== undefined) updatePayload.authorName = data.authorName;
    if (data.authorEmail !== undefined) updatePayload.authorEmail = data.authorEmail || null;
    if (data.authorDept !== undefined) updatePayload.authorDept = data.authorDept;
    if (data.writerId !== undefined) updatePayload.writerId = data.writerId || null;
    if (data.categoryId !== undefined) updatePayload.categoryId = data.categoryId;
    if (data.coverImage !== undefined) updatePayload.coverImage = data.coverImage;
    if (data.coverImagePublicId !== undefined) {
      updatePayload.coverImagePublicId = data.coverImagePublicId;
      if (
        existing.coverImagePublicId &&
        data.coverImagePublicId &&
        existing.coverImagePublicId !== data.coverImagePublicId
      ) {
        await deleteAsset(existing.coverImagePublicId, "image").catch(() => null);
      }
    }
    if (data.tags !== undefined) updatePayload.tags = data.tags;
    if (data.isFeatured !== undefined) updatePayload.isFeatured = data.isFeatured;
    if (data.editorialNotes !== undefined) updatePayload.editorialNotes = data.editorialNotes;
    if (data.submissionSource !== undefined) updatePayload.submissionSource = data.submissionSource;

    if (data.status !== undefined) {
      updatePayload.status = data.status;
      if (data.status === "PUBLISHED" && !existing.publishedAt) {
        updatePayload.publishedAt = new Date();
      }
    }

    const updated = await prisma.article.update({
      where: { id },
      data: updatePayload,
      include: {
        category: true,
        writer: { select: { id: true, name: true, slug: true, profileImageUrl: true } },
      },
    });

    // Record activity
    await prisma.editorialActivity.create({
      data: {
        action: "ARTICLE_UPDATED",
        entityType: "ARTICLE",
        entityId: updated.id,
        entityTitle: updated.title,
        performedBy: session.username || "editor",
        details: `Updated metadata/content. Status: ${updated.status}`,
      },
    }).catch(() => null);

    revalidatePath("/articles");
    revalidatePath(`/articles/${existing.slug}`);
    if (data.slug && data.slug !== existing.slug) {
      revalidatePath(`/articles/${data.slug}`);
    }
    revalidatePath("/writers");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: "Article updated successfully.",
      article: updated,
    });
  } catch (error) {
    console.error("[Admin Article API] Error updating article:", error);
    return NextResponse.json(
      { error: "Failed to update article." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/articles/[id]
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
    const existing = await prisma.article.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    if (existing.coverImagePublicId) {
      await deleteAsset(existing.coverImagePublicId, "image").catch(() => null);
    }

    await prisma.article.delete({ where: { id } });

    await prisma.editorialActivity.create({
      data: {
        action: "ARTICLE_DELETED",
        entityType: "ARTICLE",
        entityId: existing.id,
        entityTitle: existing.title,
        performedBy: session.username || "editor",
        details: `Deleted article "${existing.title}"`,
      },
    }).catch(() => null);

    revalidatePath("/articles");
    revalidatePath(`/articles/${existing.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: `Article "${existing.title}" deleted successfully.`,
    });
  } catch (error) {
    console.error("[Admin Article API] Error deleting article:", error);
    return NextResponse.json(
      { error: "Failed to delete article." },
      { status: 500 }
    );
  }
}
