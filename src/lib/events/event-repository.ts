import {
  MagazineEvent,
  EventCategory,
  EventFilterParams,
  EventStatus,
  EventCategoryType,
  EventAgendaItem,
} from "@/types/event";
import { prisma } from "@/lib/prisma";
import { toDateKey } from "./event-date-utils";
import type { Event as DbEvent } from "@prisma/client";

export interface IEventRepository {
  getEvents(params?: EventFilterParams): Promise<MagazineEvent[]>;
  getEventBySlug(slug: string): Promise<MagazineEvent | null>;
  getFeaturedEvents(limit?: number): Promise<MagazineEvent[]>;
  getUpcomingEvents(limit?: number): Promise<MagazineEvent[]>;
  getPastEvents(limit?: number): Promise<MagazineEvent[]>;
  getUpcomingThisMonth(
    year?: number,
    monthIndex?: number,
    limit?: number
  ): Promise<MagazineEvent[]>;
  getEventCategories(): Promise<EventCategory[]>;
  getAllEventDateKeys(): Promise<Set<string>>;
}

/**
 * Calculates temporal status based on current time
 */
export function computeEventTemporalStatus(startAt: Date, endAt: Date): EventStatus {
  const now = new Date();
  if (now < startAt) return "upcoming";
  if (now > endAt) return "past";
  return "ongoing";
}

/**
 * Maps a Prisma Event model record to MagazineEvent
 */
export function mapDbEventToMagazineEvent(db: DbEvent): MagazineEvent {
  const start = new Date(db.startAt);
  const end = new Date(db.endAt);

  return {
    id: db.id,
    slug: db.slug,
    title: db.title,
    excerpt: db.excerpt || "",
    description: db.description,
    category: db.category as EventCategoryType,
    categorySlug: db.categorySlug,
    coverImage: db.coverImage || "/images/editorial/technology.jpg",
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    timezone: db.timezone,
    venue: db.venue,
    organizer: db.organizer,
    participantCount: db.participantCount || undefined,
    capacity: db.capacity || undefined,
    audience: db.audience || undefined,
    agenda: Array.isArray(db.agenda)
      ? (db.agenda as unknown as EventAgendaItem[])
      : undefined,
    tags: Array.isArray(db.tags) ? (db.tags as string[]) : [],
    isFeatured: db.isFeatured,
    status: computeEventTemporalStatus(start, end),
  };
}

export class PrismaEventRepository implements IEventRepository {
  async getEvents(params?: EventFilterParams): Promise<MagazineEvent[]> {
    try {
      const now = new Date();
      const where: Record<string, unknown> = {
        publicationStatus: "PUBLISHED",
      };

      if (params) {
        const { filter, category, search } = params;

        // Filter by category slug
        if (category) {
          where.categorySlug = category;
        }

        // Search query
        if (search && search.trim()) {
          const q = search.trim();
          where.OR = [
            { title: { contains: q, mode: "insensitive" } },
            { excerpt: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { venue: { contains: q, mode: "insensitive" } },
            { organizer: { contains: q, mode: "insensitive" } },
          ];
        }

        // Temporal filter (upcoming, ongoing, past)
        if (filter === "upcoming") {
          where.startAt = { gte: now };
        } else if (filter === "past") {
          where.endAt = { lt: now };
        } else if (filter === "ongoing") {
          where.startAt = { lte: now };
          where.endAt = { gte: now };
        }
      }

      // Determine sorting
      let orderBy: { startAt: "asc" | "desc" } = { startAt: "asc" };
      if (params?.sort === "oldest" || params?.sort === "date-latest") {
        orderBy = { startAt: "desc" };
      }

      const dbEvents = await prisma.event.findMany({
        where,
        orderBy,
      });

      let results = dbEvents.map(mapDbEventToMagazineEvent);

      // Selected calendar date filter (YYYY-MM-DD)
      if (params?.selectedDate) {
        results = results.filter((e) => toDateKey(e.startAt) === params.selectedDate);
      }

      return results;
    } catch (err) {
      console.error("[PrismaEventRepository] Error getting events:", err);
      return [];
    }
  }

  async getEventBySlug(slug: string): Promise<MagazineEvent | null> {
    try {
      const dbEvent = await prisma.event.findFirst({
        where: {
          slug,
          publicationStatus: "PUBLISHED",
        },
      });

      if (!dbEvent) return null;
      return mapDbEventToMagazineEvent(dbEvent);
    } catch (err) {
      console.error("[PrismaEventRepository] Error getting event by slug:", err);
      return null;
    }
  }

  async getUpcomingEvents(limit: number = 6): Promise<MagazineEvent[]> {
    try {
      const now = new Date();
      const dbEvents = await prisma.event.findMany({
        where: {
          publicationStatus: "PUBLISHED",
          endAt: { gte: now },
        },
        orderBy: { startAt: "asc" },
        take: limit,
      });

      return dbEvents.map(mapDbEventToMagazineEvent);
    } catch (err) {
      console.error("[PrismaEventRepository] Error getting upcoming events:", err);
      return [];
    }
  }

  async getPastEvents(limit: number = 4): Promise<MagazineEvent[]> {
    try {
      const now = new Date();
      const dbEvents = await prisma.event.findMany({
        where: {
          publicationStatus: "PUBLISHED",
          endAt: { lt: now },
        },
        orderBy: { startAt: "desc" },
        take: limit,
      });

      return dbEvents.map(mapDbEventToMagazineEvent);
    } catch (err) {
      console.error("[PrismaEventRepository] Error getting past events:", err);
      return [];
    }
  }

  async getFeaturedEvents(limit: number = 4): Promise<MagazineEvent[]> {
    try {
      const dbEvents = await prisma.event.findMany({
        where: {
          publicationStatus: "PUBLISHED",
          isFeatured: true,
        },
        orderBy: { startAt: "asc" },
        take: limit,
      });

      return dbEvents.map(mapDbEventToMagazineEvent);
    } catch (err) {
      console.error("[PrismaEventRepository] Error getting featured events:", err);
      return [];
    }
  }

  async getUpcomingThisMonth(
    year?: number,
    monthIndex?: number,
    limit: number = 3
  ): Promise<MagazineEvent[]> {
    try {
      const now = new Date();
      const y = typeof year === "number" ? year : now.getFullYear();
      const m = typeof monthIndex === "number" ? monthIndex : now.getMonth();
      const startOfMonth = new Date(y, m, 1);
      const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999);

      const dbEvents = await prisma.event.findMany({
        where: {
          publicationStatus: "PUBLISHED",
          startAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        orderBy: { startAt: "asc" },
        take: limit,
      });

      return dbEvents.map(mapDbEventToMagazineEvent);
    } catch (err) {
      console.error("[PrismaEventRepository] Error getting this month events:", err);
      return [];
    }
  }

  async getEventCategories(): Promise<EventCategory[]> {
    try {
      const categories: Array<{ id: string; name: string; slug: string; description: string }> = [
        {
          id: "cat-workshop",
          name: "Seminars & Workshops",
          slug: "workshops",
          description: "Hands-on technical and academic training sessions",
        },
        {
          id: "cat-student",
          name: "Student Activities",
          slug: "student-activities",
          description: "Clubs, cultural celebrations, and campus sports",
        },
        {
          id: "cat-innovation",
          name: "Competitions & Innovation",
          slug: "competitions",
          description: "Hackathons, research awards, and startup challenges",
        },
        {
          id: "cat-networking",
          name: "Community & Networking",
          slug: "community",
          description: "Alumni meets, volunteer clean-ups, and industry panels",
        },
      ];

      // Count events per category from database
      const counts = await Promise.all(
        categories.map((c) =>
          prisma.event.count({
            where: {
              categorySlug: c.slug,
              publicationStatus: "PUBLISHED",
            },
          })
        )
      );

      return categories.map((c, i) => ({
        ...c,
        count: counts[i],
      }));
    } catch (err) {
      console.error("[PrismaEventRepository] Error getting event categories:", err);
      return [];
    }
  }

  async getAllEventDateKeys(): Promise<Set<string>> {
    try {
      const dbEvents = await prisma.event.findMany({
        where: { publicationStatus: "PUBLISHED" },
        select: { startAt: true },
      });

      const keys = new Set<string>();
      dbEvents.forEach((e) => {
        keys.add(toDateKey(e.startAt));
      });
      return keys;
    } catch (err) {
      console.error("[PrismaEventRepository] Error getting event date keys:", err);
      return new Set();
    }
  }
}

export const eventRepository = new PrismaEventRepository();
