"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  MagazineEvent,
  EventFilter,
  EventSortOption,
} from "@/types/event";
import { eventRepository } from "@/lib/events/event-repository";
import { EventsHero } from "./events-hero";
import { EventsToolbar } from "./events-toolbar";
import { UpcomingEventsSection } from "./upcoming-events-section";
import { PastEventsSection } from "./past-events-section";
import { EventCalendar } from "./sidebar/event-calendar";
import { UpcomingThisMonthWidget } from "./sidebar/upcoming-this-month-widget";
import { SuggestEventWidget } from "./sidebar/suggest-event-widget";
import { EventDetailModal } from "./event-detail-modal";
import { SuggestEventModal } from "./suggest-event-modal";
import { Filter, X } from "lucide-react";

export function EventsView() {
  const [, startTransition] = useTransition();

  // Filters & State
  const [filter, setFilter] = useState<EventFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [currentSort, setCurrentSort] = useState<EventSortOption>("newest");
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  );

  // Data states
  const [events, setEvents] = useState<MagazineEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<MagazineEvent[]>([]);
  const [upcomingThisMonth, setUpcomingThisMonth] = useState<MagazineEvent[]>(
    []
  );
  const [eventDateKeys, setEventDateKeys] = useState<Set<string>>(new Set());

  // Modal states
  const [activeEvent, setActiveEvent] = useState<MagazineEvent | null>(null);
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);

  // Initial load for sidebar widgets & calendar
  useEffect(() => {
    async function loadInitialData() {
      const [past, thisMonth, dateKeys] = await Promise.all([
        eventRepository.getPastEvents(4),
        eventRepository.getUpcomingThisMonth(2025, 9, 3), // October 2025
        eventRepository.getAllEventDateKeys(),
      ]);

      setPastEvents(past);
      setUpcomingThisMonth(thisMonth);
      setEventDateKeys(dateKeys);
    }
    loadInitialData();
  }, []);

  // Fetch filtered events whenever filters change
  useEffect(() => {
    let isCancelled = false;

    async function fetchFilteredEvents() {
      const results = await eventRepository.getEvents({
        filter,
        category: selectedCategory,
        search: searchQuery,
        sort: currentSort,
        selectedDate,
      });

      if (!isCancelled) {
        startTransition(() => {
          setEvents(results);
        });
      }
    }

    fetchFilteredEvents();

    return () => {
      isCancelled = true;
    };
  }, [filter, selectedCategory, searchQuery, currentSort, selectedDate]);

  // Reset all active filters
  const handleResetFilters = () => {
    setFilter("all");
    setSearchQuery("");
    setSelectedCategory(undefined);
    setSelectedDate(undefined);
    setCurrentSort("newest");
  };

  const hasActiveFilters = Boolean(
    selectedCategory || searchQuery || selectedDate || filter !== "all"
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* 1. Events Hero Section matching Reference Screenshot */}
      <EventsHero
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 2. Glassmorphism Filter Tabs & Search Toolbar */}
      <EventsToolbar
        currentFilter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
      />

      {/* 3. Active Context Filter Badges (if any filter is applied) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600">
          <div className="flex items-center gap-1.5 font-semibold text-gray-700 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#00C800]" />
            <span>Active filters:</span>
          </div>

          {filter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-800 font-medium">
              <span>Status: {filter}</span>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="hover:text-red-500"
                aria-label="Clear status filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-800 font-medium">
              <span>Category: {selectedCategory}</span>
              <button
                type="button"
                onClick={() => setSelectedCategory(undefined)}
                className="hover:text-red-500"
                aria-label="Clear category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedDate && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-800 font-medium">
              <span>Date: {selectedDate}</span>
              <button
                type="button"
                onClick={() => setSelectedDate(undefined)}
                className="hover:text-red-500"
                aria-label="Clear date filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-800 font-medium">
              <span>Search: &quot;{searchQuery}&quot;</span>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="hover:text-red-500"
                aria-label="Clear search filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="ml-auto text-xs font-semibold text-[#00A800] hover:text-[#008800] underline cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* 4. Two-Column Main Content & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Area (8 Cols on Desktop) */}
        <div className="lg:col-span-8 min-w-0">
          {/* Upcoming Events Section (or filtered events) */}
          <UpcomingEventsSection
            events={events}
            onSelectEvent={setActiveEvent}
            onResetFilters={handleResetFilters}
            sectionTitle={
              filter === "past"
                ? "Past Events"
                : filter === "ongoing"
                  ? "Ongoing Events"
                  : selectedDate
                    ? `Events on ${selectedDate}`
                    : "Upcoming Events"
            }
          />

          {/* Past Events Section (shown when viewing all/upcoming) */}
          {filter !== "past" && (
            <PastEventsSection
              events={pastEvents}
              onSelectEvent={setActiveEvent}
              onViewAllPast={() => {
                setFilter("past");
                window.scrollTo({ top: 400, behavior: "smooth" });
              }}
            />
          )}
        </div>

        {/* Right Sidebar Widgets Area (4 Cols on Desktop) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Calendar Widget */}
          <EventCalendar
            eventDateKeys={eventDateKeys}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          {/* Upcoming This Month Widget */}
          <UpcomingThisMonthWidget
            events={upcomingThisMonth}
            onSelectEvent={setActiveEvent}
            onViewAllUpcoming={() => setFilter("upcoming")}
          />

          {/* Have an Event Idea? Call-to-Action Card */}
          <SuggestEventWidget
            onOpenSuggestModal={() => setSuggestModalOpen(true)}
          />
        </div>
      </div>

      {/* 5. Apple-style Event Detail Modal */}
      <EventDetailModal
        event={activeEvent}
        isOpen={Boolean(activeEvent)}
        onClose={() => setActiveEvent(null)}
      />

      {/* 6. Suggest an Event Modal */}
      <SuggestEventModal
        isOpen={suggestModalOpen}
        onClose={() => setSuggestModalOpen(false)}
      />
    </div>
  );
}
