import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { deleteAsset } from "@/lib/storage";
import { z } from "zod";

const updateMagazineSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").optional(),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase alphanumeric characters and hyphens")
    .optional(),
  edition: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  coverImage: z.string().trim().optional().nullable(),
  coverImagePublicId: z.string().trim().optional().nullable(),
  pdfAsset: z.string().trim().min(1, "PDF file asset is required").optional(),
  pdfAssetPublicId: z.string().trim().optional().nullable(),
  publicationDate: z.string().optional().nullable(),
  publicationYear: z.number().int().optional().nullable(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

// GET /api/admin/magazines/[id]
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
    const magazine = await prisma.magazineIssue.findUnique({
      where: { id },
    });

    if (!magazine) {
      return NextResponse.json({ error: "Magazine not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, magazine });
  } catch (error) {
    console.error("[AdminMagazines API] Error retrieving magazine:", error);
    return NextResponse.json(
      { error: "Failed to retrieve magazine." },
      { status: 500 }
    );
  }
}

// PUT /api/admin/magazines/[id] - Update magazine
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.magazineIssue.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Magazine not found." }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateMagazineSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    const data = parsed.data;

    // If slug is changing, verify new slug uniqueness
    if (data.slug && data.slug !== existing.slug) {
      const duplicateSlug = await prisma.magazineIssue.findUnique({
        where: { slug: data.slug },
      });
      if (duplicateSlug) {
        return NextResponse.json(
          { error: "Another magazine already uses this slug." },
          { status: 409 }
        );
      }
    }

    const updatePayload: Record<string, unknown> = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.slug !== undefined) updatePayload.slug = data.slug;
    if (data.edition !== undefined) updatePayload.edition = data.edition;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.coverImage !== undefined) updatePayload.coverImage = data.coverImage;
    if (data.coverImagePublicId !== undefined) updatePayload.coverImagePublicId = data.coverImagePublicId;
    if (data.pdfAsset !== undefined) updatePayload.pdfAsset = data.pdfAsset;
    if (data.pdfAssetPublicId !== undefined) updatePayload.pdfAssetPublicId = data.pdfAssetPublicId;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.isFeatured !== undefined) updatePayload.isFeatured = Boolean(data.isFeatured);
    if (data.publicationYear !== undefined) updatePayload.publicationYear = data.publicationYear;
    if (data.publicationDate !== undefined) {
      updatePayload.publicationDate = data.publicationDate
        ? new Date(data.publicationDate)
        : null;
    }

    const updated = await prisma.magazineIssue.update({
      where: { id },
      data: updatePayload,
    });

    // Record activity
    await prisma.editorialActivity.create({
      data: {
        action: "MAGAZINE_UPDATED",
        entityType: "MAGAZINE",
        entityId: updated.id,
        entityTitle: updated.title,
        performedBy: session.username || "editor",
        details: `Updated magazine edition ${updated.edition || "standard"}. Status: ${updated.status}`,
      },
    }).catch(() => null);

    // Revalidate paths
    revalidatePath("/magazines");
    revalidatePath(`/magazines/${existing.slug}`);
    if (data.slug && data.slug !== existing.slug) {
      revalidatePath(`/magazines/${data.slug}`);
    }
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: "Magazine updated successfully.",
      magazine: updated,
    });
  } catch (error) {
    console.error("[AdminMagazines API] Error updating magazine:", error);
    return NextResponse.json(
      { error: "Failed to update magazine publication." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/magazines/[id] - Delete magazine
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
    const existing = await prisma.magazineIssue.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Magazine not found." }, { status: 404 });
    }

    // Safely cleanup assets if possible
    if (existing.coverImagePublicId) {
      await deleteAsset(existing.coverImagePublicId, "image").catch(() => null);
    }
    if (existing.pdfAssetPublicId) {
      await deleteAsset(existing.pdfAssetPublicId, "pdf").catch(() => null);
    }

    await prisma.magazineIssue.delete({
      where: { id },
    });

    // Record activity
    await prisma.editorialActivity.create({
      data: {
        action: "MAGAZINE_DELETED",
        entityType: "MAGAZINE",
        entityId: existing.id,
        entityTitle: existing.title,
        performedBy: session.username || "editor",
        details: `Permanently deleted magazine "${existing.title}"`,
      },
    }).catch(() => null);

    // Revalidate paths
    revalidatePath("/magazines");
    revalidatePath(`/magazines/${existing.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: `Magazine "${existing.title}" deleted successfully.`,
    });
  } catch (error) {
    console.error("[AdminMagazines API] Error deleting magazine:", error);
    return NextResponse.json(
      { error: "Failed to delete magazine publication." },
      { status: 500 }
    );
  }
}

