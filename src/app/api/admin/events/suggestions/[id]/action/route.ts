import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().trim().optional().nullable(),
  publishImmediately: z.boolean().optional().default(false),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const suggestion = await prisma.eventSuggestion.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!suggestion) {
      return NextResponse.json({ error: "Event suggestion not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = actionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { action, rejectionReason, publishImmediately } = validated.data;

    if (action === "REJECT") {
      const updated = await prisma.eventSuggestion.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionReason || "Does not meet editorial requirements at this time.",
        },
      });

      await prisma.editorialActivity.create({
        data: {
          action: "EVENT_SUGGESTION_REJECTED",
          entityType: "EVENT",
          entityId: id,
          entityTitle: suggestion.title,
          performedBy: session.username || "editor@bbst.uwu.ac.lk",
          details: `Rejected suggestion from ${suggestion.organizerEmail}. Reason: ${rejectionReason || "None specified"}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Event suggestion rejected.",
        suggestion: updated,
      });
    }

    if (action === "APPROVE") {
      // Prevent duplicate creation
      if (suggestion.status === "APPROVED" && suggestion.event) {
        return NextResponse.json(
          {
            error: "This suggestion is already approved.",
            eventId: suggestion.event.id,
          },
          { status: 409 }
        );
      }

      // Generate base slug from title
      const baseSlug = suggestion.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      let slug = baseSlug || `event-${Date.now()}`;

      // Ensure slug uniqueness
      let counter = 1;
      while (await prisma.event.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Parse suggested date or default to 14 days from now
      let startDate = new Date();
      if (suggestion.suggestedDate && !isNaN(Date.parse(suggestion.suggestedDate))) {
        startDate = new Date(suggestion.suggestedDate);
      } else {
        startDate.setDate(startDate.getDate() + 14);
        startDate.setHours(10, 0, 0, 0);
      }

      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 3);

      const categorySlug = suggestion.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      // Create the event and update the suggestion atomically
      const [newEvent, updatedSuggestion] = await prisma.$transaction([
        prisma.event.create({
          data: {
            title: suggestion.title,
            slug,
            excerpt: suggestion.description.slice(0, 160),
            description: suggestion.description,
            category: suggestion.category,
            categorySlug: categorySlug || "workshops",
            startAt: startDate,
            endAt: endDate,
            venue: suggestion.venue || "Faculty of Technological Studies, UWU",
            organizer: suggestion.organizerName || "BBST Community",
            publicationStatus: publishImmediately ? "PUBLISHED" : "DRAFT",
            suggestionId: suggestion.id,
          },
        }),
        prisma.eventSuggestion.update({
          where: { id },
          data: { status: "APPROVED" },
        }),
      ]);

      await prisma.editorialActivity.create({
        data: {
          action: "EVENT_SUGGESTION_APPROVED",
          entityType: "EVENT",
          entityId: newEvent.id,
          entityTitle: newEvent.title,
          performedBy: session.username || "editor@bbst.uwu.ac.lk",
          details: `Approved suggestion from ${suggestion.organizerEmail} and created event ${newEvent.title}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Suggestion approved. Event created as ${newEvent.publicationStatus}.`,
        event: newEvent,
        suggestion: updatedSuggestion,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("[AdminEventSuggestionActionAPI] Error processing action:", error);
    return NextResponse.json(
      { error: "Failed to process event suggestion action." },
      { status: 500 }
    );
  }
}
