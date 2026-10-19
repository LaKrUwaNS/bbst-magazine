"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import {
  Article,
  ArticleFilter,
  CategoryWithCount,
} from "@/types/article";
import { articleRepository } from "@/lib/articles/article-repository";
import { ArticlesHero } from "./articles-hero";
import { ArticlesToolbar } from "./articles-toolbar";
import { ArticleGrid } from "./article-grid";
import { CategoriesWidget } from "./sidebar/categories-widget";
import { PopularTagsWidget } from "./sidebar/popular-tags-widget";
import { StayUpdatedWidget } from "./sidebar/stay-updated-widget";
import { ArticleDetailModal } from "./article-detail-modal";
import { X, Filter } from "lucide-react";

interface ArticlesViewProps {
  initialCategory?: string;
  initialQuery?: string;
}

export function ArticlesView({
  initialCategory,
  initialQuery,
}: ArticlesViewProps) {
  const [, startTransition] = useTransition();

  // State
  const [filter, setFilter] = useState<ArticleFilter>("all");
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    initialCategory,
  );
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);

  // Data states
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);

  // Modal State
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  // Initial load
  useEffect(() => {
    async function loadInitialData() {
      const [cats, tags, latest] = await Promise.all([
        articleRepository.getCategories(),
        articleRepository.getPopularTags(),
        articleRepository.getLatestArticles(4),
      ]);
      setCategories(cats);
      setPopularTags(tags);
      setLatestArticles(latest);
    }
    loadInitialData();
  }, []);

  // Fetch articles on filter/search/category/tag changes
  useEffect(() => {
    let isCancelled = false;

    async function fetchFilteredArticles() {
      const results = await articleRepository.getArticles({
        filter,
        category: selectedCategory,
        tag: selectedTag,
        search: searchQuery,
      });

      if (!isCancelled) {
        startTransition(() => {
          setArticles(results);
        });
      }
    }

    fetchFilteredArticles();

    return () => {
      isCancelled = true;
    };
  }, [filter, selectedCategory, selectedTag, searchQuery]);

  // Open modal and load related articles
  const handleSelectArticle = async (article: Article) => {
    setActiveArticle(article);
    const related = await articleRepository.getRelatedArticles(
      article.slug,
      article.category.slug,
      3,
    );
    setRelatedArticles(related);
  };

  // Close modal
  const handleCloseModal = () => {
    setActiveArticle(null);
    setRelatedArticles([]);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilter("all");
    setSearchQuery("");
    setSelectedCategory(undefined);
    setSelectedTag(undefined);
  };

  // Active filter indicators
  const activeCategoryObj = useMemo(() => {
    return categories.find((c) => c.slug === selectedCategory);
  }, [categories, selectedCategory]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* 1. Hero Section matching Screenshot 1 */}
      <ArticlesHero />

      {/* 2. Filter Tabs + Search Toolbar */}
      <ArticlesToolbar
        currentFilter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 3. Active Context Filter Badges (if category or tag is selected) */}
      {(selectedCategory || selectedTag || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600">
          <div className="flex items-center gap-1.5 font-semibold text-gray-700 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#00C800]" />
            <span>Active filters:</span>
          </div>

          {selectedCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-800 font-medium shadow-2xs">
              Category: {activeCategoryObj?.name || selectedCategory}
              <button
                type="button"
                onClick={() => setSelectedCategory(undefined)}
                className="hover:text-black cursor-pointer"
                aria-label="Clear category filter"
              >
                <X className="w-3 h-3 text-gray-400 hover:text-black" />
              </button>
            </span>
          )}

          {selectedTag && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-800 font-medium shadow-2xs">
              Tag: #{selectedTag}
              <button
                type="button"
                onClick={() => setSelectedTag(undefined)}
                className="hover:text-black cursor-pointer"
                aria-label="Clear tag filter"
              >
                <X className="w-3 h-3 text-gray-400 hover:text-black" />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-800 font-medium shadow-2xs">
              Query: &ldquo;{searchQuery}&rdquo;
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="hover:text-black cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="w-3 h-3 text-gray-400 hover:text-black" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-[#00C800] hover:text-[#00A800] font-semibold underline underline-offset-2 ml-auto cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* 4. Main Two-Column Layout (Article Grid + Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Article Cards Grid (8 cols) */}
        <main className="lg:col-span-8">
          <ArticleGrid
            articles={articles}
            onSelectArticle={handleSelectArticle}
            onResetFilters={handleResetFilters}
          />
        </main>

        {/* Right Column: Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Categories Widget */}
          <CategoriesWidget
            categories={categories}
            selectedCategorySlug={selectedCategory}
            onSelectCategory={(slug) => setSelectedCategory(slug)}
          />

          {/* Popular Tags Widget */}
          <PopularTagsWidget
            tags={popularTags}
            selectedTag={selectedTag}
            onSelectTag={(tag) => setSelectedTag(tag)}
          />

          {/* Stay Updated Widget (Newsletter) */}
          <StayUpdatedWidget />
        </aside>
      </div>

      {/* 5. Apple-Style Article Detail Modal */}
      <ArticleDetailModal
        article={activeArticle}
        isOpen={!!activeArticle}
        onClose={handleCloseModal}
        relatedArticles={relatedArticles}
        latestArticles={latestArticles}
        categories={categories}
        popularTags={popularTags}
        onSelectArticle={handleSelectArticle}
        onNavigateCategory={(slug) => setSelectedCategory(slug)}
        onNavigateTag={(tag) => setSelectedTag(tag)}
      />
    </div>
  );
}
