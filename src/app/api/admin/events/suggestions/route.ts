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
    const status = searchParams.get("status") || "all";

    const where: Record<string, unknown> = {};

    if (status !== "all") {
      where.status = status.toUpperCase();
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { organizerName: { contains: query, mode: "insensitive" } },
        { organizerEmail: { contains: query, mode: "insensitive" } },
        { venue: { contains: query, mode: "insensitive" } },
      ];
    }

    const suggestions = await prisma.eventSuggestion.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            publicationStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const pendingCount = await prisma.eventSuggestion.count({
      where: { status: "PENDING" },
    });
    const approvedCount = await prisma.eventSuggestion.count({
      where: { status: "APPROVED" },
    });
    const rejectedCount = await prisma.eventSuggestion.count({
      where: { status: "REJECTED" },
    });

    return NextResponse.json({
      success: true,
      suggestions,
      counts: {
        total: suggestions.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (error) {
    console.error("[AdminEventSuggestionsAPI] Error fetching suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch event suggestions" },
      { status: 500 }
    );
  }
}
