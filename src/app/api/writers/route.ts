import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FALLBACK_WRITERS } from "@/data/writers.data";

interface RawWriterListItem {
  id: string;
  name: string;
  slug: string;
  shortBio: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  department: string | null;
  academicYear: string | null;
  role: string | null;
  expertise: string | null;
  socialLinks: unknown;
  website: string | null;
  isFeatured: boolean;
  createdAt: Date;
  _count: {
    articles: number;
  };
}

interface FormattedWriterItem {
  id: string;
  name: string;
  slug: string;
  shortBio: string;
  profileImageUrl: string;
  department: string;
  academicYear: string | null;
  role: string;
  expertise: string[];
  socialLinks: Record<string, string>;
  website: string | null;
  isFeatured: boolean;
  publishedArticlesCount: number;
}

// GET /api/writers - Public writers directory endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const department = searchParams.get("department")?.trim() || "";
    const sortBy = searchParams.get("sortBy") || "featured"; // featured, name, articles
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(6, parseInt(searchParams.get("pageSize") || "24", 10)));

    const where: Record<string, unknown> = {
      status: "PUBLISHED",
    };

    if (department && department !== "all") {
      where.department = { contains: department, mode: "insensitive" };
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { department: { contains: query, mode: "insensitive" } },
        { role: { contains: query, mode: "insensitive" } },
        { expertise: { contains: query, mode: "insensitive" } },
        { shortBio: { contains: query, mode: "insensitive" } },
      ];
    }

    // Determine ordering
    let orderBy: Array<Record<string, "asc" | "desc">> = [{ isFeatured: "desc" }, { name: "asc" }];
    if (sortBy === "name") {
      orderBy = [{ name: "asc" }];
    } else if (sortBy === "recent") {
      orderBy = [{ createdAt: "desc" }];
    }

    const [total, rawWriters] = await Promise.all([
      prisma.writerProfile.count({ where }),
      prisma.writerProfile.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          shortBio: true,
          bio: true,
          profileImageUrl: true,
          department: true,
          academicYear: true,
          role: true,
          expertise: true,
          socialLinks: true,
          website: true,
          isFeatured: true,
          createdAt: true,
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
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    // Format writers with published article count
    const writers: FormattedWriterItem[] = rawWriters.map((w: RawWriterListItem) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      shortBio: w.shortBio || w.bio?.slice(0, 160) || "",
      profileImageUrl: w.profileImageUrl || "/images/avatar1.jpg",
      department: w.department || "BBST Department",
      academicYear: w.academicYear,
      role: w.role || "Contributor",
      expertise: w.expertise ? w.expertise.split(",").map((e: string) => e.trim()).filter(Boolean) : [],
      socialLinks: (w.socialLinks as Record<string, string>) || {},
      website: w.website,
      isFeatured: w.isFeatured,
      publishedArticlesCount: w._count.articles,
    }));

    if (sortBy === "articles") {
      writers.sort((a: FormattedWriterItem, b: FormattedWriterItem) => b.publishedArticlesCount - a.publishedArticlesCount);
    }

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
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      (error as { digest: string }).digest === "NEXT_PRERENDER_INTERRUPTED"
    ) {
      throw error;
    }
    console.error("[Public Writers API] Database query failed or timed out, returning fallback writers:", error);
    return NextResponse.json({
      success: true,
      writers: FALLBACK_WRITERS,
      pagination: {
        page: 1,
        pageSize: FALLBACK_WRITERS.length,
        total: FALLBACK_WRITERS.length,
        totalPages: 1,
      },
    });
  }
}
