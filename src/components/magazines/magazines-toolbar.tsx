"use client";

import React from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  Layers,
  FlaskConical,
  Sprout,
  Compass,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import {
  MagazineCategory,
  MagazineSortOption,
  MagazineFiltersState,
} from "@/types/magazine";

interface MagazinesToolbarProps {
  filters: MagazineFiltersState;
  onFilterChange: <K extends keyof MagazineFiltersState>(
    key: K,
    value: MagazineFiltersState[K]
  ) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  availableYears: string[];
}

interface CategoryTab {
  id: MagazineCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORY_TABS: CategoryTab[] = [
  { id: "all", label: "All Editions", icon: Layers },
  { id: "research-tech", label: "Research & Tech", icon: FlaskConical },
  { id: "agriculture-environment", label: "Agriculture & Eco", icon: Sprout },
  { id: "campus-culture", label: "Campus & Heritage", icon: Compass },
  { id: "special-edition", label: "Special Anthologies", icon: Sparkles },
];

export function MagazinesToolbar({
  filters,
  onFilterChange,
  onResetFilters,
  totalFilteredCount,
  availableYears,
}: MagazinesToolbarProps) {
  const isFiltered =
    filters.searchQuery !== "" ||
    filters.selectedCategory !== "all" ||
    filters.selectedYear !== "all" ||
    filters.sortBy !== "newest";

  return (
    <div className="space-y-4 mb-8">
      {/* Top Row: Search Input + Year Filter + Sort By Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange("searchQuery", e.target.value)}
            placeholder="Search magazines by title, theme, or keyword..."
            aria-label="Search magazines"
            className="w-full pl-10 pr-9 py-2.5 text-sm rounded-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#00C800] focus:ring-2 focus:ring-[#00FF00]/20 outline-none transition-all placeholder:text-gray-400"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange("searchQuery", "")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black rounded-full transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Controls: Year Selector + Sorting Dropdown + Reset */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year Filter Select */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-2xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500">Year:</span>
            <select
              value={filters.selectedYear}
              onChange={(e) => onFilterChange("selectedYear", e.target.value)}
              aria-label="Filter magazines by year"
              className="bg-transparent font-bold text-gray-900 outline-none cursor-pointer pr-1"
            >
              <option value="all">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Select */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onFilterChange("sortBy", e.target.value as MagazineSortOption)
              }
              aria-label="Sort magazines"
              className="bg-transparent font-bold text-gray-900 outline-none cursor-pointer pr-1"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          {/* Reset Filters Button (visible when filters are applied) */}
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              aria-label="Reset all filters"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-gray-500" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Category Filter Tabs Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
        <div
          role="tablist"
          aria-label="Filter magazines by category"
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1"
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = filters.selectedCategory === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onFilterChange("selectedCategory", tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#171717] text-white shadow-xs"
                    : "bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 hover:text-black"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-[#00FF00]" : "text-gray-500"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Results Count Counter */}
        <div className="hidden md:block text-xs font-medium text-gray-500 whitespace-nowrap">
          Showing <span className="font-bold text-[#171717]">{totalFilteredCount}</span> {totalFilteredCount === 1 ? "edition" : "editions"}
        </div>
      </div>
    </div>
  );
}
