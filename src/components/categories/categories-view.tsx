"use client";

import React, { useState, useMemo } from "react";
import {
  CategoryDetailItem,
  CategoryFiltersState,
  CategorySortOption,
} from "@/types/category";
import { CategoriesHero } from "./categories-hero";
import { FeaturedCategories } from "./featured-categories";
import { CategoriesToolbar } from "./categories-toolbar";
import { CategoriesGrid } from "./categories-grid";
import { CategoryCtaSection } from "./category-cta-section";

interface CategoriesViewProps {
  initialCategories: CategoryDetailItem[];
}

export function CategoriesView({ initialCategories }: CategoriesViewProps) {
  // Search & Sorting Filter State
  const [filters, setFilters] = useState<CategoryFiltersState>({
    searchQuery: "",
    sortBy: "articles",
  });

  // Calculate total articles across categories
  const totalArticles = useMemo(() => {
    return initialCategories.reduce((acc, cat) => acc + cat.articleCount, 0);
  }, [initialCategories]);

  // Featured Categories
  const featuredCategories = useMemo(() => {
    return initialCategories.filter((c) => c.isFeatured);
  }, [initialCategories]);

  // Handle Search Input Change
  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  // Handle Sort Option Change
  const handleSortChange = (sortBy: CategorySortOption) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  // Reset Filters
  const handleReset = () => {
    setFilters({
      searchQuery: "",
      sortBy: "articles",
    });
  };

  // Filtered and Sorted Categories List
  const filteredCategories = useMemo(() => {
    let result = [...initialCategories];

    // Search filter by name or description
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    // Sort categories
    switch (filters.sortBy) {
      case "articles":
        result.sort((a, b) => b.articleCount - a.articleCount);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return result;
  }, [initialCategories, filters]);

  const isSearchActive = filters.searchQuery.trim() !== "";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* 1. Page Header Hero Section */}
      <CategoriesHero
        searchQuery={filters.searchQuery}
        onSearchChange={handleSearchChange}
        totalCategories={initialCategories.length}
        totalArticles={totalArticles}
      />

      {/* 2. Featured Categories Section (Shown prominently when not actively filtering) */}
      {!isSearchActive && (
        <FeaturedCategories categories={featuredCategories} />
      )}

      {/* 3. Section Title & Toolbar */}
      <div className="mt-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00E500]" />
              <span>Full Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
              All Editorial Categories
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md">
            Browse publications and articles by academic domain or topic.
          </p>
        </div>

        {/* Toolbar: Search & Sorting */}
        <CategoriesToolbar
          filters={filters}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          onReset={handleReset}
          totalFiltered={filteredCategories.length}
          totalCategories={initialCategories.length}
        />
      </div>

      {/* 4. Responsive Grid of Categories */}
      <CategoriesGrid
        categories={filteredCategories}
        onResetSearch={handleReset}
      />

      {/* 5. Student Contribution CTA Section */}
      <CategoryCtaSection />
    </div>
  );
}
