"use client";

import React from "react";
import { Search, X, ArrowUpDown, RotateCcw } from "lucide-react";
import { CategoryFiltersState, CategorySortOption } from "@/types/category";

interface CategoriesToolbarProps {
  filters: CategoryFiltersState;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: CategorySortOption) => void;
  onReset: () => void;
  totalFiltered: number;
  totalCategories: number;
}

export function CategoriesToolbar({
  filters,
  onSearchChange,
  onSortChange,
  onReset,
  totalFiltered,
  totalCategories,
}: CategoriesToolbarProps) {
  const isFiltered = filters.searchQuery !== "" || filters.sortBy !== "articles";

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-8">
      {/* Search Input Box */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter categories by name or keyword..."
          aria-label="Filter categories"
          className="w-full pl-10 pr-9 py-2.5 text-sm rounded-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#00C800] focus:ring-2 focus:ring-[#00FF00]/20 outline-none transition-all placeholder:text-gray-400"
        />
        {filters.searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear filter"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black rounded-full transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right Controls: Sort Dropdown + Reset + Counter */}
      <div className="flex items-center justify-between sm:justify-end gap-3">
        {/* Sort Select */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-2xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-500">Sort:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onSortChange(e.target.value as CategorySortOption)}
            aria-label="Sort categories"
            className="bg-transparent font-bold text-gray-900 outline-none cursor-pointer pr-1"
          >
            <option value="articles">Most Articles</option>
            <option value="name-asc">Alphabetical (A–Z)</option>
            <option value="name-desc">Alphabetical (Z–A)</option>
          </select>
        </div>

        {/* Reset Button */}
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            aria-label="Reset search and sort"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-gray-500" />
            <span>Reset</span>
          </button>
        )}

        {/* Counter */}
        <div className="hidden lg:block text-xs font-medium text-gray-500 whitespace-nowrap pl-2">
          Showing <span className="font-bold text-[#171717]">{totalFiltered}</span> of {totalCategories} categories
        </div>
      </div>
    </div>
  );
}
