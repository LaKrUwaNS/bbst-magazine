"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Article } from "@/types/article";

interface LatestArticlesWidgetProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  showViewAll?: boolean;
}

export function LatestArticlesWidget({
  articles,
  onSelectArticle,
  showViewAll = true,
}: LatestArticlesWidgetProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
        <h3 className="font-bold text-base text-[#171717]">Latest Articles</h3>
        {showViewAll && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#00C800] cursor-pointer">
            View All
            <ArrowRight className="w-3 h-3" />
          </span>
        )}
      </div>

      {/* Articles List */}
      <div className="space-y-3.5">
        {articles.map((article) => (
          <div
            key={article.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectArticle(article)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectArticle(article);
              }
            }}
            className="group flex items-center gap-3 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#00C800]/30 rounded-xl p-1 -m-1"
          >
            {/* Thumbnail */}
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                sizes="56px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col min-w-0 flex-1">
              <h4 className="text-xs sm:text-[13px] font-bold text-[#171717] group-hover:text-[#00A800] transition-colors line-clamp-2 leading-tight mb-1">
                {article.title}
              </h4>
              <span className="text-[10px] text-gray-400">
                {article.publishedAt}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
