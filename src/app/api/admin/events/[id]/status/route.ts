import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const validated = statusSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid status. Must be DRAFT, PUBLISHED, or ARCHIVED." },
        { status: 400 }
      );
    }

    const { status } = validated.data;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: { publicationStatus: status },
    });

    await prisma.editorialActivity.create({
      data: {
        action: status === "PUBLISHED" ? "EVENT_PUBLISHED" : "EVENT_UNPUBLISHED",
        entityType: "EVENT",
        entityId: id,
        entityTitle: updated.title,
        performedBy: session.username || "editor@bbst.uwu.ac.lk",
        details: `Event status changed from ${existing.publicationStatus} to ${status}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Event status updated to ${status}.`,
      event: updated,
    });
  } catch (error) {
    console.error("[AdminEventStatusAPI] Error updating status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
