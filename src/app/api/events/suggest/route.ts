import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const suggestEventSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    category: z.string().trim().default("WORKSHOP"),
    suggestedDate: z.string().trim().optional().nullable(),
    venue: z.string().trim().optional().nullable(),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
    organizerName: z.string().trim().optional().nullable(),
    email: z.string().trim().email("A valid email address is required").optional().nullable(),
    organizerEmail: z.string().trim().email("A valid email address is required").optional().nullable(),
  })
  .refine((data) => Boolean(data.email || data.organizerEmail), {
    message: "A valid email address is required",
    path: ["email"],
  });

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = suggestEventSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      title,
      category,
      suggestedDate,
      venue,
      description,
      organizerName,
      email,
      organizerEmail,
    } = parsed.data;

    const contactEmail = (email || organizerEmail) as string;

    // Create the EventSuggestion record
    const suggestion = await prisma.eventSuggestion.create({
      data: {
        title,
        category,
        suggestedDate: suggestedDate || null,
        venue: venue || null,
        description,
        organizerName: organizerName || contactEmail.split("@")[0] || "Event Organizer",
        organizerEmail: contactEmail,
        status: "PENDING",
      },
    });

    // Create an EditorialActivity log for dashboard audit
    await prisma.editorialActivity.create({
      data: {
        action: "EVENT_SUGGESTION_SUBMITTED",
        entityType: "EVENT",
        entityId: suggestion.id,
        entityTitle: suggestion.title,
        performedBy: contactEmail,
        details: `Public suggestion submitted for category: ${category}`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your event suggestion has been submitted to the editorial board for review.",
        suggestionId: suggestion.id,
        suggestion: { id: suggestion.id },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[SuggestEventAPI] Failed to save event suggestion:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while processing your suggestion." },
      { status: 500 }
    );
  }
}
