"use client";

import React from "react";
import { Article } from "@/types/article";
import { ArticleCard } from "./article-card";
import { motion, useReducedMotion } from "framer-motion";
import { FileQuestion, RotateCcw } from "lucide-react";

interface ArticleGridProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onResetFilters: () => void;
}

export function ArticleGrid({
  articles,
  onSelectArticle,
  onResetFilters,
}: ArticleGridProps) {
  const shouldReduceMotion = useReducedMotion();

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-1">
          No articles found
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mb-5">
          We couldn&apos;t find any articles matching your search criteria. Try
          adjusting your filters or search keywords.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:text-black hover:border-gray-300 shadow-2xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {articles.map((article, index) => (
        <motion.div
          key={article.id}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: shouldReduceMotion ? 0 : Math.min(index * 0.05, 0.4),
            ease: "easeOut",
          }}
        >
          <ArticleCard article={article} onSelect={onSelectArticle} />
        </motion.div>
      ))}
    </div>
  );
}
