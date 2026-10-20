import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status") || "ALL_QUEUE";
    const category = searchParams.get("category") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(5, parseInt(searchParams.get("pageSize") || "15", 10)));

    const where: Record<string, unknown> = {};

    // Filter by submission queue statuses
    if (status === "ALL_QUEUE") {
      where.status = {
        in: ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "APPROVED"],
      };
    } else if (status !== "ALL") {
      where.status = status;
    }

    if (category !== "all") {
      where.categoryId = category;
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { authorName: { contains: query, mode: "insensitive" } },
        { authorEmail: { contains: query, mode: "insensitive" } },
        { submissionRef: { contains: query, mode: "insensitive" } },
      ];
    }

    const [total, submissions] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          revisions: { select: { id: true, createdAt: true, status: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      success: true,
      submissions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error) {
    console.error("[Admin Submissions API] Error:", error);
    return NextResponse.json(
      { error: "Failed to load submission queue." },
      { status: 500 }
    );
  }
}
