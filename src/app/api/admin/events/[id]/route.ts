import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateEventSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").optional(),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase alphanumeric characters and hyphens")
    .optional(),
  excerpt: z.string().trim().optional().nullable(),
  description: z.string().trim().min(10, "Description must be at least 10 characters").optional(),
  category: z.string().trim().optional(),
  categorySlug: z.string().trim().optional(),
  coverImage: z.string().trim().optional().nullable(),
  coverImagePublicId: z.string().trim().optional().nullable(),
  startAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Valid start date is required")
    .optional(),
  endAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Valid end date is required")
    .optional(),
  timezone: z.string().trim().optional(),
  venue: z.string().trim().min(2, "Venue is required").optional(),
  organizer: z.string().trim().min(2, "Organizer is required").optional(),
  participantCount: z.string().trim().optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  audience: z.string().trim().optional().nullable(),
  agenda: z
    .array(
      z.object({
        time: z.string(),
        title: z.string(),
        speaker: z.string().optional(),
      })
    )
    .optional()
    .nullable(),
  tags: z.array(z.string()).optional().nullable(),
  isFeatured: z.boolean().optional(),
  publicationStatus: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/events/[id] - Get event details
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        suggestion: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("[AdminEventsAPI] Error fetching single event:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

// PUT /api/admin/events/[id] - Update event
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = updateEventSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Check slug uniqueness if slug changed
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.event.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "Another event already has this slug." },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.categorySlug !== undefined && { categorySlug: data.categorySlug }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
        ...(data.coverImagePublicId !== undefined && { coverImagePublicId: data.coverImagePublicId }),
        ...(data.startAt !== undefined && { startAt: new Date(data.startAt) }),
        ...(data.endAt !== undefined && { endAt: new Date(data.endAt) }),
        ...(data.timezone !== undefined && { timezone: data.timezone }),
        ...(data.venue !== undefined && { venue: data.venue }),
        ...(data.organizer !== undefined && { organizer: data.organizer }),
        ...(data.participantCount !== undefined && { participantCount: data.participantCount }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.audience !== undefined && { audience: data.audience }),
        ...(data.agenda !== undefined && { agenda: data.agenda as unknown as object }),
        ...(data.tags !== undefined && { tags: data.tags as unknown as object }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.publicationStatus !== undefined && { publicationStatus: data.publicationStatus }),
      },
    });

    // Editorial audit log
    await prisma.editorialActivity.create({
      data: {
        action: "EVENT_UPDATED",
        entityType: "EVENT",
        entityId: id,
        entityTitle: updated.title,
        performedBy: session.username || "editor@bbst.uwu.ac.lk",
        details: "Event details updated by editor",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event updated successfully.",
      event: updated,
    });
  } catch (error) {
    console.error("[AdminEventsAPI] Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE /api/admin/events/[id] - Delete event
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({ where: { id } });

    // Editorial audit log
    await prisma.editorialActivity.create({
      data: {
        action: "EVENT_DELETED",
        entityType: "EVENT",
        entityId: id,
        entityTitle: existing.title,
        performedBy: session.username || "editor@bbst.uwu.ac.lk",
        details: `Deleted event "${existing.title}"`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error("[AdminEventsAPI] Error deleting event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
