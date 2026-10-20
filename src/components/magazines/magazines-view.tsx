"use client";

import React, { useState, useMemo } from "react";
import {
  MagazineIssueItem,
  MagazineFiltersState,
} from "@/types/magazine";
import { MagazinesHero } from "./magazines-hero";
import { FeaturedMagazine } from "./featured-magazine";
import { MagazinesToolbar } from "./magazines-toolbar";
import { MagazineGrid } from "./magazine-grid";
import { MagazineReaderModal } from "./magazine-reader-modal";
import { MagazineArchiveSection } from "./magazine-archive-section";

interface MagazinesViewProps {
  initialMagazines: MagazineIssueItem[];
}

export function MagazinesView({ initialMagazines }: MagazinesViewProps) {
  // Filters and Sorting State
  const [filters, setFilters] = useState<MagazineFiltersState>({
    searchQuery: "",
    selectedCategory: "all",
    selectedYear: "all",
    sortBy: "newest",
  });

  // Modal Reader State
  const [readingMagazine, setReadingMagazine] =
    useState<MagazineIssueItem | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  // Derive unique years available in collection
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    initialMagazines.forEach((m) => {
      if (m.year) yearsSet.add(m.year.toString());
    });
    return Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a));
  }, [initialMagazines]);

  // Identify Featured Magazine (latest flagged or newest)
  const featuredMagazine = useMemo(() => {
    return (
      initialMagazines.find((m) => m.isFeatured) ||
      initialMagazines[0] ||
      null
    );
  }, [initialMagazines]);

  // Handle filter changes
  const handleFilterChange = <K extends keyof MagazineFiltersState>(
    key: K,
    value: MagazineFiltersState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      selectedCategory: "all",
      selectedYear: "all",
      sortBy: "newest",
    });
  };

  // Open Online Reader Modal
  const handleReadOnline = (magazine: MagazineIssueItem) => {
    setReadingMagazine(magazine);
    setIsReaderOpen(true);
  };

  // Close Online Reader Modal
  const handleCloseReader = () => {
    setIsReaderOpen(false);
  };

  // Filter and Sort Magazines
  const filteredMagazines = useMemo(() => {
    let result = [...initialMagazines];

    // Filter by search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.edition.toLowerCase().includes(q) ||
          m.categoryLabel.toLowerCase().includes(q) ||
          m.highlights.some((h) => h.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (filters.selectedCategory !== "all") {
      result = result.filter((m) => m.category === filters.selectedCategory);
    }

    // Filter by publication year
    if (filters.selectedYear !== "all") {
      const yearNum = parseInt(filters.selectedYear, 10);
      if (!isNaN(yearNum)) {
        result = result.filter((m) => m.year === yearNum);
      }
    }

    // Sort magazines
    switch (filters.sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.publicationDate).getTime() -
            new Date(a.publicationDate).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.publicationDate).getTime() -
            new Date(b.publicationDate).getTime()
        );
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [initialMagazines, filters]);

  // Determine if active search/filter is hiding the featured section
  const isFilteringActive =
    filters.searchQuery !== "" ||
    filters.selectedCategory !== "all" ||
    filters.selectedYear !== "all";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* 1. Page Header Hero */}
      <MagazinesHero totalCount={initialMagazines.length} />

      {/* 2. Featured Magazine Section (Shown prominently when not searching) */}
      {featuredMagazine && !isFilteringActive && (
        <FeaturedMagazine
          magazine={featuredMagazine}
          onReadOnline={handleReadOnline}
        />
      )}

      {/* 3. Section Title & Toolbar */}
      <div className="mt-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00E500]" />
              <span>Complete Collection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
              All Published Editions
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md">
            Browse through university volumes, thematic research issues, and student anthologies.
          </p>
        </div>

        {/* Toolbar: Search, Filters, Sorting */}
        <MagazinesToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalFilteredCount={filteredMagazines.length}
          availableYears={availableYears}
        />
      </div>

      {/* 4. Responsive Grid of Magazine Cards */}
      <MagazineGrid
        magazines={filteredMagazines}
        onReadOnline={handleReadOnline}
        onResetFilters={handleResetFilters}
        latestMagazineId={featuredMagazine?.id}
      />

      {/* 5. Historical Archive & Call for Submissions Section */}
      <MagazineArchiveSection />

      {/* 6. Interactive Digital Reader Modal */}
      <MagazineReaderModal
        key={readingMagazine?.id}
        magazine={readingMagazine}
        isOpen={isReaderOpen}
        onClose={handleCloseReader}
      />
    </div>
  );
}
