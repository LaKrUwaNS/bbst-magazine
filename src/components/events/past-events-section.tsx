"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { MagazineEvent } from "@/types/event";
import { PastEventCard } from "./past-event-card";

interface PastEventsSectionProps {
  events: MagazineEvent[];
  onSelectEvent: (event: MagazineEvent) => void;
  onViewAllPast: () => void;
}

export function PastEventsSection({
  events,
  onSelectEvent,
  onViewAllPast,
}: PastEventsSectionProps) {
  if (events.length === 0) return null;

  return (
    <section className="mt-8 pt-8 border-t border-gray-100">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-6 bg-[#00E500] rounded-full mt-0.5 shrink-0" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
              Past Events
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Take a look at our recent events and activities.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewAllPast}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A800] hover:text-[#008800] transition-colors cursor-pointer group shrink-0"
        >
          <span>View All Past Events</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 4 Cards Grid matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {events.slice(0, 4).map((event) => (
          <PastEventCard
            key={event.id}
            event={event}
            onSelect={onSelectEvent}
          />
        ))}
      </div>
    </section>
  );
}
