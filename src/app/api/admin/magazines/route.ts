import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createMagazineSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase alphanumeric characters and hyphens"),
  edition: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  coverImage: z.string().trim().optional().nullable(),
  coverImagePublicId: z.string().trim().optional().nullable(),
  pdfAsset: z.string().trim().min(1, "PDF file asset is required"),
  pdfAssetPublicId: z.string().trim().optional().nullable(),
  publicationDate: z.string().optional().nullable(),
  publicationYear: z.number().int().optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

// GET /api/admin/magazines - List magazines with search & filter
export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status") || "all";

    const where: Record<string, unknown> = {};

    if (status !== "all") {
      where.status = status;
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    const magazines = await prisma.magazineIssue.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      magazines,
      total: magazines.length,
    });
  } catch (error) {
    console.error("[AdminMagazines API] Error fetching magazines:", error);
    return NextResponse.json(
      { error: "Failed to fetch magazine publications." },
      { status: 500 }
    );
  }
}

// POST /api/admin/magazines - Create new magazine
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = createMagazineSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    const data = parsed.data;

    // Check slug uniqueness
    const existing = await prisma.magazineIssue.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A magazine with this slug already exists. Please choose a unique slug." },
        { status: 409 }
      );
    }

    const pubDate = data.publicationDate ? new Date(data.publicationDate) : new Date();

    const created = await prisma.magazineIssue.create({
      data: {
        title: data.title,
        slug: data.slug,
        edition: data.edition || null,
        description: data.description || null,
        coverImage: data.coverImage || "/images/Magazine.png",
        coverImagePublicId: data.coverImagePublicId || null,
        pdfAsset: data.pdfAsset,
        pdfAssetPublicId: data.pdfAssetPublicId || null,
        publicationDate: pubDate,
        publicationYear: data.publicationYear || pubDate.getFullYear(),
        isFeatured: Boolean(data.isFeatured),
        status: data.status,
      },
    });

    // Record editorial activity
    await prisma.editorialActivity.create({
      data: {
        action: "MAGAZINE_CREATED",
        entityType: "MAGAZINE",
        entityId: created.id,
        entityTitle: created.title,
        performedBy: session.username || "editor",
        details: `Created edition ${created.edition || "standard"} with status ${created.status}`,
      },
    }).catch(() => null);

    // Revalidate public magazines page and admin routes
    revalidatePath("/magazines");
    revalidatePath(`/magazines/${created.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: "Magazine created successfully.",
      magazine: created,
    });
  } catch (error) {
    console.error("[AdminMagazines API] Error creating magazine:", error);
    return NextResponse.json(
      { error: "Failed to create magazine publication." },
      { status: 500 }
    );
  }
}
