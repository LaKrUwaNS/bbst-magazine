import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";

export const createWriterSchema = z.object({
  name: z.string().trim().min(2, "Writer's full name is required (min 2 characters)"),
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
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
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

// GET /api/admin/writers - List writers with search, filters, pagination
export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const department = searchParams.get("department") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(5, parseInt(searchParams.get("pageSize") || "20", 10)));

    const where: Record<string, unknown> = {};

    if (status !== "all") {
      where.status = status;
    }

    if (department !== "all") {
      where.department = { contains: department, mode: "insensitive" };
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { department: { contains: query, mode: "insensitive" } },
        { role: { contains: query, mode: "insensitive" } },
        { expertise: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
      ];
    }

    const [total, writers] = await Promise.all([
      prisma.writerProfile.count({ where }),
      prisma.writerProfile.findMany({
        where,
        include: {
          _count: {
            select: {
              articles: {
                where: {
                  status: { in: ["PUBLISHED", "published"] },
                },
              },
            },
          },
        },
        orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      success: true,
      writers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error) {
    console.error("[Admin Writers API] Error listing writers:", error);
    return NextResponse.json({ error: "Failed to retrieve writers list." }, { status: 500 });
  }
}

// POST /api/admin/writers - Create new writer profile
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = createWriterSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    const data = parsed.data;

    // Generate unique slug
    let rawSlug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);
    if (!rawSlug) {
      rawSlug = `writer-${crypto.randomBytes(3).toString("hex")}`;
    }

    let finalSlug = rawSlug;
    const existing = await prisma.writerProfile.findUnique({
      where: { slug: finalSlug },
    });
    if (existing) {
      finalSlug = `${rawSlug}-${crypto.randomBytes(2).toString("hex")}`;
    }

    const writer = await prisma.writerProfile.create({
      data: {
        name: data.name.trim(),
        slug: finalSlug,
        bio: data.bio || null,
        shortBio: data.shortBio || null,
        profileImageUrl: data.profileImageUrl || null,
        profileImagePublicId: data.profileImagePublicId || null,
        department: data.department || null,
        academicYear: data.academicYear || null,
        role: data.role || null,
        expertise: data.expertise || null,
        email: data.email || null,
        website: data.website || null,
        socialLinks: (data.socialLinks as object) || {},
        status: data.status,
        isFeatured: Boolean(data.isFeatured),
      },
    });

    // Record editorial activity
    await prisma.editorialActivity.create({
      data: {
        action: "WRITER_CREATED",
        entityType: "ARTICLE",
        entityId: writer.id,
        entityTitle: writer.name,
        performedBy: session.username || "editor",
        details: `Created writer profile "${writer.name}" (Status: ${writer.status})`,
      },
    }).catch(() => null);

    revalidatePath("/writers");
    revalidatePath(`/writers/${writer.slug}`);
    revalidatePath("/admin/writers");

    return NextResponse.json(
      {
        success: true,
        message: "Writer profile created successfully.",
        writer,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create writer profile.";
    console.error("[Admin Writers API] Error creating writer:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
