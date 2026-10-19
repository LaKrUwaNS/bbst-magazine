"use client";

import React, { useState } from "react";
import {
  Search,
  X,
  Layers,
  Clock,
  Flame,
  Award,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { ArticleFilter } from "@/types/article";
import { motion, useReducedMotion } from "framer-motion";

interface ArticlesToolbarProps {
  currentFilter: ArticleFilter;
  onFilterChange: (filter: ArticleFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface FilterTab {
  id: ArticleFilter;
  label: string;
  icon: LucideIcon;
}

const TABS: FilterTab[] = [
  { id: "all", label: "All Articles", icon: Layers },
  { id: "latest", label: "Latest", icon: Clock },
  { id: "trending", label: "Trending", icon: Flame },
  { id: "editors-picks", label: "Editor's Picks", icon: Award },
  { id: "most-read", label: "Most Read", icon: Sparkles },
];

export function ArticlesToolbar({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: ArticlesToolbarProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hoveredTab, setHoveredTab] = useState<ArticleFilter | null>(null);

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
      {/* Filter Tabs Navigation Bar */}
      <div
        role="tablist"
        aria-label="Filter articles by status"
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
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 whitespace-nowrap cursor-pointer select-none isolate ${
                isActive
                  ? "text-white font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {/* Active Tab Spring Indicator Pill */}
              {isActive && (
                <motion.div
                  layoutId={shouldReduceMotion ? undefined : "activeFilterTabPill"}
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
                  layoutId={shouldReduceMotion ? undefined : "hoverFilterTabPill"}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 bg-white rounded-full shadow-xs -z-10 border border-gray-200/60"
                />
              )}

              {/* Tab Icon */}
              <Icon
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 transition-transform duration-200 ${
                  isActive
                    ? "text-white scale-105"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />

              {/* Tab Label */}
              <span className="relative z-10 tracking-tight">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Real-time Article Search Input */}
      <div className="relative w-full md:w-72 lg:w-80 shrink-0">
        <label htmlFor="article-search" className="sr-only">
          Search articles
        </label>
        <div className="relative flex items-center group">
          <Search className="absolute left-3.5 w-4 h-4 text-gray-400 group-focus-within:text-[#00C800] transition-colors duration-200 pointer-events-none" />
          <input
            id="article-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search articles..."
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
    </div>
  );
}
