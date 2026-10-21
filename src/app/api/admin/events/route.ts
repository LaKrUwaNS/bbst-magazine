import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase alphanumeric characters and hyphens"),
  excerpt: z.string().trim().optional().nullable(),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  category: z.string().trim().default("WORKSHOP"),
  categorySlug: z.string().trim().default("workshops"),
  coverImage: z.string().trim().optional().nullable(),
  coverImagePublicId: z.string().trim().optional().nullable(),
  startAt: z.string().refine((val) => !isNaN(Date.parse(val)), "Valid start date is required"),
  endAt: z.string().refine((val) => !isNaN(Date.parse(val)), "Valid end date is required"),
  timezone: z.string().trim().default("Asia/Colombo"),
  venue: z.string().trim().min(2, "Venue is required"),
  organizer: z.string().trim().min(2, "Organizer is required"),
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
  isFeatured: z.boolean().default(false),
  publicationStatus: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  suggestionId: z.string().trim().optional().nullable(),
});

// GET /api/admin/events - List events with search, filter, and statistics
export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const category = searchParams.get("category") || "all";

    const where: Record<string, unknown> = {};

    if (status !== "all") {
      where.publicationStatus = status.toUpperCase();
    }

    if (category !== "all") {
      where.categorySlug = category;
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { venue: { contains: query, mode: "insensitive" } },
        { organizer: { contains: query, mode: "insensitive" } },
      ];
    }

    const [events, totalCount, publishedCount, draftCount, pendingSuggestionsCount] =
      await Promise.all([
        prisma.event.findMany({
          where,
          include: {
            suggestion: {
              select: {
                id: true,
                organizerName: true,
                organizerEmail: true,
                status: true,
              },
            },
          },
          orderBy: { startAt: "desc" },
        }),
        prisma.event.count(),
        prisma.event.count({ where: { publicationStatus: "PUBLISHED" } }),
        prisma.event.count({ where: { publicationStatus: "DRAFT" } }),
        prisma.eventSuggestion.count({ where: { status: "PENDING" } }),
      ]);

    return NextResponse.json({
      success: true,
      events,
      stats: {
        total: totalCount,
        published: publishedCount,
        drafts: draftCount,
        pendingSuggestions: pendingSuggestionsCount,
      },
    });
  } catch (error) {
    console.error("[AdminEventsAPI] Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to retrieve events" },
      { status: 500 }
    );
  }
}

// POST /api/admin/events - Create new event
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = createEventSchema.safeParse(body);

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

    // Check slug uniqueness
    const existing = await prisma.event.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An event with this slug already exists. Please choose a unique slug." },
        { status: 409 }
      );
    }

    // Check suggestion uniqueness if provided
    if (data.suggestionId) {
      const linkedEvent = await prisma.event.findUnique({
        where: { suggestionId: data.suggestionId },
      });
      if (linkedEvent) {
        return NextResponse.json(
          { error: "This event suggestion has already been approved and converted to an event." },
          { status: 409 }
        );
      }
    }

    const newEvent = await prisma.event.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        description: data.description,
        category: data.category,
        categorySlug: data.categorySlug,
        coverImage: data.coverImage || null,
        coverImagePublicId: data.coverImagePublicId || null,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
        timezone: data.timezone,
        venue: data.venue,
        organizer: data.organizer,
        participantCount: data.participantCount || null,
        capacity: data.capacity || null,
        audience: data.audience || null,
        agenda: (data.agenda ?? null) as unknown as object,
        tags: (data.tags ?? []) as unknown as object,
        isFeatured: data.isFeatured,
        publicationStatus: data.publicationStatus,
        suggestionId: data.suggestionId || null,
      },
    });

    // If linked to suggestion, mark suggestion as APPROVED
    if (data.suggestionId) {
      await prisma.eventSuggestion.update({
        where: { id: data.suggestionId },
        data: { status: "APPROVED" },
      });
    }

    // Editorial audit log
    await prisma.editorialActivity.create({
      data: {
        action: data.publicationStatus === "PUBLISHED" ? "EVENT_PUBLISHED" : "EVENT_CREATED",
        entityType: "EVENT",
        entityId: newEvent.id,
        entityTitle: newEvent.title,
        performedBy: session.username || "editor@bbst.uwu.ac.lk",
        details: `Event created with status ${data.publicationStatus}`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully.",
        event: newEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[AdminEventsAPI] Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
