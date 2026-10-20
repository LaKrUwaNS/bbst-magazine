import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { deleteAsset } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateWriterSchema = z.object({
  name: z.string().trim().min(2).optional(),
  slug: z.string().trim().optional(),
  bio: z.string().trim().optional().nullable(),
  shortBio: z.string().trim().optional().nullable(),
  profileImageUrl: z.string().optional().nullable(),
  profileImagePublicId: z.string().optional().nullable(),
  department: z.string().trim().optional().nullable(),
  academicYear: z.string().trim().optional().nullable(),
  role: z.string().trim().optional().nullable(),
  expertise: z.string().trim().optional().nullable(),
  email: z
    .string()
    .trim()
    .email("Valid email required")
    .optional()
    .nullable()
    .or(z.literal("")),
  website: z
    .string()
    .trim()
    .url("Valid website URL required")
    .optional()
    .nullable()
    .or(z.literal("")),
  socialLinks: z
    .object({
      linkedin: z.string().trim().optional(),
      twitter: z.string().trim().optional(),
      github: z.string().trim().optional(),
      website: z.string().trim().optional(),
    })
    .optional()
    .nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

// GET /api/admin/writers/[id] - Retrieve single writer with articles
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
    const writer = await prisma.writerProfile.findUnique({
      where: { id },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            status: true,
            publishedAt: true,
            createdAt: true,
            category: { select: { id: true, name: true, slug: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!writer) {
      return NextResponse.json({ error: "Writer profile not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, writer });
  } catch (error) {
    console.error("[Admin Writer API] Error retrieving writer:", error);
    return NextResponse.json({ error: "Failed to retrieve writer profile." }, { status: 500 });
  }
}

// PATCH /api/admin/writers/[id] - Update writer profile
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
    const existing = await prisma.writerProfile.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Writer profile not found." }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateWriterSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    const data = parsed.data;

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== existing.slug) {
      const normalizedSlug = slugify(data.slug);
      const duplicate = await prisma.writerProfile.findUnique({
        where: { slug: normalizedSlug },
      });
      if (duplicate && duplicate.id !== id) {
        return NextResponse.json(
          { error: "A writer with this URL slug already exists." },
          { status: 409 }
        );
      }
      data.slug = normalizedSlug;
    }

    // If photo public ID changed, safely cleanup previous asset
    if (
      data.profileImagePublicId !== undefined &&
      data.profileImagePublicId !== existing.profileImagePublicId &&
      existing.profileImagePublicId
    ) {
      await deleteAsset(existing.profileImagePublicId, "image").catch(() => null);
    }

    const updatePayload: Record<string, unknown> = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.slug !== undefined) updatePayload.slug = data.slug;
    if (data.bio !== undefined) updatePayload.bio = data.bio;
    if (data.shortBio !== undefined) updatePayload.shortBio = data.shortBio;
    if (data.profileImageUrl !== undefined) updatePayload.profileImageUrl = data.profileImageUrl;
    if (data.profileImagePublicId !== undefined)
      updatePayload.profileImagePublicId = data.profileImagePublicId;
    if (data.department !== undefined) updatePayload.department = data.department;
    if (data.academicYear !== undefined) updatePayload.academicYear = data.academicYear;
    if (data.role !== undefined) updatePayload.role = data.role;
    if (data.expertise !== undefined) updatePayload.expertise = data.expertise;
    if (data.email !== undefined) updatePayload.email = data.email || null;
    if (data.website !== undefined) updatePayload.website = data.website || null;
    if (data.socialLinks !== undefined)
      updatePayload.socialLinks = (data.socialLinks as object) || {};
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.isFeatured !== undefined) updatePayload.isFeatured = data.isFeatured;

    const updated = await prisma.writerProfile.update({
      where: { id },
      data: updatePayload,
    });

    // Record activity
    await prisma.editorialActivity.create({
      data: {
        action: "WRITER_UPDATED",
        entityType: "ARTICLE",
        entityId: updated.id,
        entityTitle: updated.name,
        performedBy: session.username || "editor",
        details: `Updated writer profile "${updated.name}" (Status: ${updated.status})`,
      },
    }).catch(() => null);

    revalidatePath("/writers");
    revalidatePath(`/writers/${existing.slug}`);
    if (data.slug && data.slug !== existing.slug) {
      revalidatePath(`/writers/${data.slug}`);
    }
    revalidatePath("/admin/writers");

    return NextResponse.json({
      success: true,
      message: "Writer profile updated successfully.",
      writer: updated,
    });
  } catch (error) {
    console.error("[Admin Writer API] Error updating writer:", error);
    return NextResponse.json({ error: "Failed to update writer profile." }, { status: 500 });
  }
}

// DELETE /api/admin/writers/[id] - Safe deletion of writer profile
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
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    const existing = await prisma.writerProfile.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Writer profile not found." }, { status: 404 });
    }

    const articleCount = existing._count.articles;
    if (articleCount > 0 && !force) {
      return NextResponse.json(
        {
          error: `Cannot delete profile: This writer has ${articleCount} associated article(s). Please archive the profile instead, or reassign the articles.`,
          hasArticles: true,
          count: articleCount,
        },
        { status: 400 }
      );
    }

    // Safely delete profile photo from storage
    if (existing.profileImagePublicId) {
      await deleteAsset(existing.profileImagePublicId, "image").catch(() => null);
    }

    // Delete writer profile (Articles remain with preserved authorName due to onDelete: SetNull)
    await prisma.writerProfile.delete({ where: { id } });

    await prisma.editorialActivity.create({
      data: {
        action: "WRITER_DELETED",
        entityType: "ARTICLE",
        entityId: existing.id,
        entityTitle: existing.name,
        performedBy: session.username || "editor",
        details: `Deleted writer profile "${existing.name}"`,
      },
    }).catch(() => null);

    revalidatePath("/writers");
    revalidatePath(`/writers/${existing.slug}`);
    revalidatePath("/admin/writers");

    return NextResponse.json({
      success: true,
      message: `Writer profile "${existing.name}" deleted successfully.`,
    });
  } catch (error) {
    console.error("[Admin Writer API] Error deleting writer:", error);
    return NextResponse.json({ error: "Failed to delete writer profile." }, { status: 500 });
  }
}
