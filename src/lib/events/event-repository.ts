import {
  MagazineEvent,
  EventCategory,
  EventFilterParams,
} from "@/types/event";
import {
  MOCK_EVENTS,
  MOCK_EVENT_CATEGORIES,
} from "@/data/events.mock";
import { toDateKey } from "./event-date-utils";

export interface IEventRepository {
  getEvents(params?: EventFilterParams): Promise<MagazineEvent[]>;
  getEventBySlug(slug: string): Promise<MagazineEvent | null>;
  getUpcomingEvents(limit?: number): Promise<MagazineEvent[]>;
  getPastEvents(limit?: number): Promise<MagazineEvent[]>;
  getUpcomingThisMonth(
    year: number,
    monthIndex: number,
    limit?: number
  ): Promise<MagazineEvent[]>;
  getEventCategories(): Promise<EventCategory[]>;
  getAllEventDateKeys(): Promise<Set<string>>;
}

export class MockEventRepository implements IEventRepository {
  async getEvents(params?: EventFilterParams): Promise<MagazineEvent[]> {
    let results = [...MOCK_EVENTS];

    if (!params) return results;

    const { filter, category, search, sort, selectedDate } = params;

    // Filter by status (all, upcoming, ongoing, past)
    if (filter && filter !== "all") {
      results = results.filter((e) => e.status === filter);
    }

    // Filter by category slug
    if (category) {
      results = results.filter((e) => e.categorySlug === category);
    }

    // Filter by specific calendar date
    if (selectedDate) {
      results = results.filter((e) => toDateKey(e.startAt) === selectedDate);
    }

    // Search query match (title, excerpt, description, venue, tags)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.excerpt.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sort) {
      switch (sort) {
        case "newest":
        case "date-soonest":
          results.sort(
            (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
          );
          break;
        case "oldest":
        case "date-latest":
          results.sort(
            (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
          );
          break;
      }
    }

    return results;
  }

  async getEventBySlug(slug: string): Promise<MagazineEvent | null> {
    const event = MOCK_EVENTS.find((e) => e.slug === slug);
    return event || null;
  }

  async getUpcomingEvents(limit: number = 6): Promise<MagazineEvent[]> {
    const upcoming = MOCK_EVENTS.filter((e) => e.status === "upcoming");
    upcoming.sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
    return limit ? upcoming.slice(0, limit) : upcoming;
  }

  async getPastEvents(limit: number = 4): Promise<MagazineEvent[]> {
    const past = MOCK_EVENTS.filter((e) => e.status === "past");
    past.sort(
      (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
    );
    return limit ? past.slice(0, limit) : past;
  }

  async getUpcomingThisMonth(
    year: number,
    monthIndex: number,
    limit: number = 3
  ): Promise<MagazineEvent[]> {
    const events = MOCK_EVENTS.filter((e) => {
      const date = new Date(e.startAt);
      return (
        date.getFullYear() === year &&
        date.getMonth() === monthIndex &&
        (e.status === "upcoming" || e.status === "ongoing")
      );
    });

    events.sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
    return limit ? events.slice(0, limit) : events;
  }

  async getEventCategories(): Promise<EventCategory[]> {
    return MOCK_EVENT_CATEGORIES;
  }

  async getAllEventDateKeys(): Promise<Set<string>> {
    const keys = new Set<string>();
    MOCK_EVENTS.forEach((e) => {
      keys.add(toDateKey(e.startAt));
    });
    return keys;
  }
}

export const eventRepository = new MockEventRepository();
