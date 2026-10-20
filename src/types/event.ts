export type EventStatus = "upcoming" | "ongoing" | "past";

export type EventFilter = "all" | "upcoming" | "ongoing" | "past";

export type EventSortOption =
  | "newest"
  | "oldest"
  | "date-soonest"
  | "date-latest";

export type EventCategoryType =
  | "WORKSHOP"
  | "SEMINAR"
  | "COMPETITION"
  | "PANEL DISCUSSION"
  | "CULTURAL"
  | "NETWORKING"
  | "COMMUNITY";

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count: number;
}

export interface EventAgendaItem {
  time: string;
  title: string;
  speaker?: string;
}

export interface MagazineEvent {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  category: EventCategoryType;
  categorySlug: string;
  coverImage: string;
  startAt: string; // ISO 8601 (e.g. 2025-10-15T10:00:00+05:30)
  endAt: string;   // ISO 8601 (e.g. 2025-10-15T16:00:00+05:30)
  timezone: string; // e.g. "Asia/Colombo"
  venue: string;
  organizer: string;
  participantCount?: string;
  capacity?: number;
  audience?: string;
  agenda?: EventAgendaItem[];
  tags: string[];
  isFeatured?: boolean;
  status: EventStatus;
}

export interface EventFilterParams {
  filter?: EventFilter;
  category?: string;
  search?: string;
  sort?: EventSortOption;
  selectedDate?: string; // YYYY-MM-DD
}
