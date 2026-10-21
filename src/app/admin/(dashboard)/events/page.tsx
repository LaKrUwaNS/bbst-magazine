import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminEventsTable, AdminEventItem, EventStats } from "@/components/admin/events/admin-events-table";
import { EventSuggestionItem } from "@/components/admin/events/suggestion-review-modal";

export const metadata: Metadata = {
  title: "Events Management | BBST Magazine Editor Dashboard",
  description: "Manage university academic workshops, student activities, schedules, and public proposals.",
};

export const instant = false;

export default async function AdminEventsPage() {
  let events: AdminEventItem[] = [];
  let suggestions: EventSuggestionItem[] = [];
  let stats: EventStats = {
    total: 0,
    published: 0,
    drafts: 0,
    pendingSuggestions: 0,
  };

  try {
    const [dbEvents, dbSuggestions, totalCount, publishedCount, draftCount, pendingSuggestionsCount] =
      await Promise.all([
        prisma.event.findMany({
          orderBy: { startAt: "desc" },
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
        }),
        prisma.eventSuggestion.findMany({
          orderBy: { createdAt: "desc" },
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
        }),
        prisma.event.count(),
        prisma.event.count({ where: { publicationStatus: "PUBLISHED" } }),
        prisma.event.count({ where: { publicationStatus: "DRAFT" } }),
        prisma.eventSuggestion.count({ where: { status: "PENDING" } }),
      ]);

    events = dbEvents.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      excerpt: e.excerpt,
      description: e.description,
      category: e.category,
      categorySlug: e.categorySlug,
      coverImage: e.coverImage,
      coverImagePublicId: e.coverImagePublicId,
      startAt: e.startAt.toISOString(),
      endAt: e.endAt.toISOString(),
      timezone: e.timezone,
      venue: e.venue,
      organizer: e.organizer,
      participantCount: e.participantCount,
      capacity: e.capacity,
      audience: e.audience,
      agenda: e.agenda,
      tags: e.tags,
      isFeatured: e.isFeatured,
      publicationStatus: e.publicationStatus,
      suggestionId: e.suggestionId,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      suggestion: e.suggestion,
    }));

    suggestions = dbSuggestions.map((s) => ({
      id: s.id,
      title: s.title,
      category: s.category,
      suggestedDate: s.suggestedDate,
      venue: s.venue,
      description: s.description,
      organizerName: s.organizerName,
      organizerEmail: s.organizerEmail,
      status: s.status,
      rejectionReason: s.rejectionReason,
      createdAt: s.createdAt.toISOString(),
      event: s.event,
    }));

    stats = {
      total: totalCount,
      published: publishedCount,
      drafts: draftCount,
      pendingSuggestions: pendingSuggestionsCount,
    };
  } catch (error) {
    console.error("[AdminEventsPage] Failed to fetch events from database:", error);
  }

  return (
    <div className="space-y-6">
      <AdminEventsTable
        initialEvents={events}
        initialSuggestions={suggestions}
        initialStats={stats}
      />
    </div>
  );
}
