"use client";

import React from "react";
import Image from "next/image";
import { Clock, MapPin, Users, ArrowRight } from "lucide-react";
import { MagazineEvent, EventCategoryType } from "@/types/event";
import { formatEventDate, formatEventTimeRange } from "@/lib/events/event-date-utils";

interface EventCardProps {
  event: MagazineEvent;
  onSelect: (event: MagazineEvent) => void;
}

// Category pill colors matching the vibrant palette in the screenshot
const CATEGORY_COLORS: Record<EventCategoryType, { bg: string; text: string }> = {
  WORKSHOP: { bg: "bg-blue-600 text-white", text: "text-white" },
  SEMINAR: { bg: "bg-[#00C800] text-white", text: "text-white" },
  COMPETITION: { bg: "bg-purple-600 text-white", text: "text-white" },
  "PANEL DISCUSSION": { bg: "bg-amber-600 text-white", text: "text-white" },
  CULTURAL: { bg: "bg-rose-500 text-white", text: "text-white" },
  NETWORKING: { bg: "bg-emerald-600 text-white", text: "text-white" },
  COMMUNITY: { bg: "bg-teal-600 text-white", text: "text-white" },
};

export function EventCard({ event, onSelect }: EventCardProps) {
  const { month, day } = formatEventDate(event.startAt);
  const timeRange = formatEventTimeRange(event.startAt, event.endAt);
  const categoryStyle =
    CATEGORY_COLORS[event.category] || {
      bg: "bg-[#00C800] text-white",
      text: "text-white",
    };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(event);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(event)}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00C800]/40"
      aria-label={`View event details: ${event.title}`}
    >
      {/* Cover Image Container */}
      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-gray-100">
        <Image
          src={event.coverImage}
          alt={event.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Top-Left Badges: Date Box + Category Pill matching screenshot */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          {/* White Date Box Badge */}
          <div className="flex flex-col items-center justify-center w-11 h-12 bg-white/95 backdrop-blur-md rounded-xl shadow-xs border border-white/60 text-center leading-none px-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">
              {month}
            </span>
            <span className="text-base font-black text-[#171717] mt-0.5">
              {day}
            </span>
          </div>

          {/* Category Pill Badge */}
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs ${categoryStyle.bg}`}
          >
            {event.category}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Title + Interactive Arrow */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-base text-[#171717] group-hover:text-[#00A800] transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>
          <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-[#00E500] group-hover:border-[#00C800] transition-colors mt-0.5 shadow-2xs">
            <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Metadata Details (Time, Location, Participant Count) */}
        <div className="mt-auto space-y-1.5 pt-3 border-t border-gray-100/80 text-xs text-gray-500 font-medium">
          {/* Time */}
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{timeRange}</span>
          </div>

          {/* Venue & Capacity / Participants */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>

            {event.participantCount && (
              <div className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                <Users className="w-3 h-3 text-gray-400" />
                <span>{event.participantCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
