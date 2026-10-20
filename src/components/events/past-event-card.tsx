"use client";

import React from "react";
import Image from "next/image";
import { MagazineEvent } from "@/types/event";
import { formatEventDate } from "@/lib/events/event-date-utils";

interface PastEventCardProps {
  event: MagazineEvent;
  onSelect: (event: MagazineEvent) => void;
}

export function PastEventCard({ event, onSelect }: PastEventCardProps) {
  const { month, day, year } = formatEventDate(event.startAt);

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
      className="group relative flex flex-col bg-white rounded-xl border border-gray-100 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00C800]/40"
      aria-label={`View past event: ${event.title}`}
    >
      {/* Cover Image Container */}
      <div className="relative w-full h-32 sm:h-36 overflow-hidden bg-gray-100">
        <Image
          src={event.coverImage}
          alt={event.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
          {month} {day}, {year}
        </span>
        <h3 className="font-bold text-xs sm:text-sm text-[#171717] group-hover:text-[#00A800] transition-colors line-clamp-2 leading-snug">
          {event.title}
        </h3>
      </div>
    </div>
  );
}
