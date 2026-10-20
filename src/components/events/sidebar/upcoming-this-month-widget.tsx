"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { MagazineEvent } from "@/types/event";
import { formatEventDate, formatEventTimeRange } from "@/lib/events/event-date-utils";

interface UpcomingThisMonthWidgetProps {
  events: MagazineEvent[];
  onSelectEvent: (event: MagazineEvent) => void;
  onViewAllUpcoming: () => void;
}

export function UpcomingThisMonthWidget({
  events,
  onSelectEvent,
  onViewAllUpcoming,
}: UpcomingThisMonthWidgetProps) {
  if (events.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm sm:text-base text-[#171717]">
          Upcoming This Month
        </h3>
        <button
          type="button"
          onClick={onViewAllUpcoming}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#00A800] hover:text-[#008800] transition-colors cursor-pointer group"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Events List matching screenshot */}
      <div className="space-y-3">
        {events.slice(0, 3).map((event) => {
          const { month, day } = formatEventDate(event.startAt);
          const timeRange = formatEventTimeRange(event.startAt, event.endAt);

          return (
            <div
              key={event.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectEvent(event)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectEvent(event);
                }
              }}
              className="group flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <Image
                  src={event.coverImage}
                  alt={event.title}
                  fill
                  sizes="48px"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Date Box */}
              <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-center leading-none shrink-0">
                <span className="text-[8.5px] font-black uppercase text-gray-500">
                  {month}
                </span>
                <span className="text-xs font-black text-[#171717] mt-0.5">
                  {day}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#171717] group-hover:text-[#00A800] transition-colors line-clamp-1 leading-snug">
                  {event.title}
                </h4>
                <div className="flex items-center gap-1 text-[10.5px] text-gray-400 mt-1">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span className="truncate">{timeRange}</span>
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
