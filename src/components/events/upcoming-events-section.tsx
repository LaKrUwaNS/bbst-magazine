"use client";

import React from "react";
import { MagazineEvent } from "@/types/event";
import { EventCard } from "./event-card";
import { CalendarX, RotateCcw } from "lucide-react";

interface UpcomingEventsSectionProps {
  events: MagazineEvent[];
  onSelectEvent: (event: MagazineEvent) => void;
  onResetFilters: () => void;
  sectionTitle?: string;
  sectionSubtitle?: string;
}

export function UpcomingEventsSection({
  events,
  onSelectEvent,
  onResetFilters,
  sectionTitle = "Upcoming Events",
  sectionSubtitle = "Be part of exciting events and activities from our university.",
}: UpcomingEventsSectionProps) {
  return (
    <section className="mb-10 sm:mb-12">
      {/* Section Header with Signature Green Indicator Bar */}
      <div className="flex items-start gap-3 mb-6">
        <div className="w-1.5 h-6 bg-[#00E500] rounded-full mt-0.5 shrink-0" />
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
            {sectionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {sectionSubtitle}
          </p>
        </div>
      </div>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={onSelectEvent}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-gray-200/80 bg-gray-50/50">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#00C800] flex items-center justify-center mb-3">
            <CalendarX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#171717] mb-1">
            No events match your criteria
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-4">
            Try adjusting your search query, selecting a different category, or switching calendar dates.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </section>
  );
}
