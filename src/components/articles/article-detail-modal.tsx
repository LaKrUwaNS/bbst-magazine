"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { Article, CategoryWithCount } from "@/types/article";
import { ArticleDetailContent } from "./article-detail-content";
import { CategoriesWidget } from "./sidebar/categories-widget";
import { LatestArticlesWidget } from "./sidebar/latest-articles-widget";
import { StayUpdatedWidget } from "./sidebar/stay-updated-widget";
import { PopularTagsWidget } from "./sidebar/popular-tags-widget";

interface ArticleDetailModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  relatedArticles: Article[];
  latestArticles: Article[];
  categories: CategoryWithCount[];
  popularTags: string[];
  onSelectArticle: (article: Article) => void;
  onNavigateCategory?: (categorySlug: string) => void;
  onNavigateTag?: (tag: string) => void;
}

export function ArticleDetailModal({
  article,
  isOpen,
  onClose,
  relatedArticles,
  latestArticles,
  categories,
  popularTags,
  onSelectArticle,
  onNavigateCategory,
  onNavigateTag,
}: ArticleDetailModalProps) {
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll locking for background body
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Keyboard accessibility: Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Smoothly scroll modal top when article changes
  useEffect(() => {
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [article?.id]);

  if (!isOpen || !article) return null;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={article.title}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8"
      >
        {/* Apple-style Glassmorphism Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 bg-black/45 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.96, y: 16 }
          }
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.96, y: 16 }
          }
          transition={{ type: "spring", bounce: 0.12, duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl max-h-[92vh] sm:max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-10"
        >
          {/* Top Bar with Prominent Close Button */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-gray-100">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
              <span className="w-2 h-2 rounded-full bg-[#00E500]" />
              <span>BBST Editorial Reader</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close reading modal"
              className="p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Internal Scrollable Body */}
          <div
            ref={modalScrollRef}
            className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-10 py-6 sm:py-8 overscroll-contain"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Left Column: Full Editorial Content Reader (8 cols) */}
              <div className="lg:col-span-8">
                <ArticleDetailContent
                  article={article}
                  relatedArticles={relatedArticles}
                  onSelectArticle={onSelectArticle}
                  onNavigateCategory={(slug) => {
                    onNavigateCategory?.(slug);
                    onClose();
                  }}
                />
              </div>

              {/* Right Column: Modal Sidebar (4 cols) */}
              <aside className="lg:col-span-4 space-y-6 pt-2">
                {/* 1. Categories Widget */}
                <CategoriesWidget
                  categories={categories}
                  selectedCategorySlug={article.category.slug}
                  onSelectCategory={(slug) => {
                    if (slug) {
                      onNavigateCategory?.(slug);
                      onClose();
                    }
                  }}
                  showViewAll={false}
                />

                {/* 2. Latest Articles Widget (Clicking smoothly switches active article!) */}
                <LatestArticlesWidget
                  articles={latestArticles}
                  onSelectArticle={onSelectArticle}
                  showViewAll={false}
                />

                {/* 3. Stay Updated Newsletter Widget */}
                <StayUpdatedWidget />

                {/* 4. Popular Tags Widget */}
                <PopularTagsWidget
                  tags={popularTags}
                  onSelectTag={(tag) => {
                    if (tag) {
                      onNavigateTag?.(tag);
                      onClose();
                    }
                  }}
                  showViewAll={false}
                />
              </aside>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
