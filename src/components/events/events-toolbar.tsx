"use client";

import React, { useState } from "react";
import { Search, X, ChevronDown, Layers, CalendarClock, PlayCircle, History } from "lucide-react";
import { EventFilter, EventSortOption } from "@/types/event";
import { motion, useReducedMotion } from "framer-motion";

interface EventsToolbarProps {
  currentFilter: EventFilter;
  onFilterChange: (filter: EventFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentSort: EventSortOption;
  onSortChange: (sort: EventSortOption) => void;
}

interface FilterTab {
  id: EventFilter;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: FilterTab[] = [
  { id: "all", label: "All Events", icon: Layers },
  { id: "upcoming", label: "Upcoming", icon: CalendarClock },
  { id: "ongoing", label: "Ongoing", icon: PlayCircle },
  { id: "past", label: "Past Events", icon: History },
];

export function EventsToolbar({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  currentSort,
  onSortChange,
}: EventsToolbarProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hoveredTab, setHoveredTab] = useState<EventFilter | null>(null);

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
      {/* 1. Filter Tabs Navigation Bar with Signature Glass Animation */}
      <div
        role="tablist"
        aria-label="Filter events by status"
        onMouseLeave={() => setHoveredTab(null)}
        className="relative flex items-center p-1.5 bg-gray-100/80 backdrop-blur-md rounded-full border border-gray-200/80 shadow-2xs overflow-x-auto no-scrollbar max-w-full gap-1"
      >
        {TABS.map((tab) => {
          const isActive = currentFilter === tab.id;
          const isHovered = hoveredTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onFilterChange(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
              className={`relative flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 whitespace-nowrap cursor-pointer select-none isolate ${
                isActive
                  ? "text-white font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {/* Active Tab Spring Indicator Pill */}
              {isActive && (
                <motion.div
                  layoutId={shouldReduceMotion ? undefined : "activeEventTabPill"}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 32,
                  }}
                  className="absolute inset-0 bg-[#00C800] rounded-full shadow-md shadow-[#00C800]/30 -z-10"
                />
              )}

              {/* Smooth Hover State Indicator Pill */}
              {!isActive && isHovered && (
                <motion.div
                  layoutId={shouldReduceMotion ? undefined : "hoverEventTabPill"}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 bg-white rounded-full shadow-xs -z-10 border border-gray-200/60"
                />
              )}

              <Icon
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 transition-transform duration-200 ${
                  isActive
                    ? "text-white scale-105"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />

              <span className="relative z-10 tracking-tight">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* 2. Right Side: Real-time Search + Sort by dropdown */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        {/* Real-time Event Search Input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <label htmlFor="event-search" className="sr-only">
            Search events
          </label>
          <div className="relative flex items-center group">
            <Search className="absolute left-3.5 w-4 h-4 text-gray-400 group-focus-within:text-[#00C800] transition-colors duration-200 pointer-events-none" />
            <input
              id="event-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-9.5 pr-9 py-2 text-xs sm:text-sm rounded-full border border-gray-200 bg-white placeholder-gray-400 text-[#171717] focus:outline-none focus:border-[#00C800] focus:ring-4 focus:ring-[#00C800]/15 transition-all shadow-2xs hover:border-gray-300"
            />
            {searchQuery && (
              <motion.button
                type="button"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                onClick={() => onSearchChange("")}
                aria-label="Clear search query"
                className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="relative w-full sm:w-auto shrink-0">
          <label htmlFor="event-sort" className="sr-only">
            Sort events
          </label>
          <div className="relative flex items-center">
            <select
              id="event-sort"
              value={currentSort}
              onChange={(e) => onSortChange(e.target.value as EventSortOption)}
              className="appearance-none w-full sm:w-auto pl-3.5 pr-8 py-2 text-xs sm:text-sm rounded-full border border-gray-200 bg-white font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:border-[#00C800] focus:ring-4 focus:ring-[#00C800]/15 transition-all shadow-2xs cursor-pointer"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="date-soonest">Sort by: Soonest</option>
              <option value="oldest">Sort by: Oldest</option>
              <option value="date-latest">Sort by: Latest</option>
            </select>
            <ChevronDown className="absolute right-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
