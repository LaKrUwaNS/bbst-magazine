"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Clock, Bookmark } from "lucide-react";
import { Article } from "@/types/article";

interface ArticleCardProps {
  article: Article;
  onSelect: (article: Article) => void;
}

export function ArticleCard({ article, onSelect }: ArticleCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmarkToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent opening modal
    setIsBookmarked((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(article);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(article)}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00C800]/40"
      aria-label={`Read article: ${article.title}`}
    >
      {/* Cover Image Container */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-gray-50">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Category Pill Badge on top-left of image */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-[#00E500] text-[#171717] shadow-xs">
            {article.category.name}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Title */}
        <h3 className="font-bold text-base sm:text-[17px] text-[#171717] group-hover:text-[#00A800] transition-colors line-clamp-2 leading-snug mb-2">
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4 flex-1">
          {article.excerpt}
        </p>

        {/* Metadata Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500 mt-auto">
          {/* Author info */}
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-100 shrink-0">
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                fill
                sizes="24px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-gray-900 truncate text-[11px] sm:text-xs">
                {article.author.name}
              </span>
              <span className="text-[10px] text-gray-400">
                {article.publishedAt}
              </span>
            </div>
          </div>

          {/* Reading Time & Bookmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock className="w-3 h-3 text-gray-400" />
              <span>{article.readTime}</span>
            </div>

            <button
              type="button"
              onClick={handleBookmarkToggle}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                isBookmarked
                  ? "text-[#00C800] bg-emerald-50"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  isBookmarked ? "fill-[#00C800]" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
