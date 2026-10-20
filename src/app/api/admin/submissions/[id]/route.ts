import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

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
        revisions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      article,
    });
  } catch (error) {
    console.error("[Admin Submission Detail API] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve submission." },
      { status: 500 }
    );
  }
}
