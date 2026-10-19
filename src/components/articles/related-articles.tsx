"use client";

import React from "react";
import Image from "next/image";
import { Article } from "@/types/article";

interface RelatedArticlesProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export function RelatedArticles({
  articles,
  onSelectArticle,
}: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <div className="mt-10 pt-6 border-t border-gray-100">
      {/* Section Heading with Green Vertical Accent */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-5 rounded-full bg-[#00E500]" />
        <h3 className="font-bold text-lg text-[#171717]">Related Articles</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            className="group flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#00C800]/30"
          >
            {/* Image */}
            <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-gray-100">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-[#00E500] text-[#171717]">
                  {article.category.name}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col flex-1 justify-between">
              <h4 className="font-bold text-xs sm:text-[13px] text-[#171717] group-hover:text-[#00A800] transition-colors line-clamp-2 leading-snug mb-2">
                {article.title}
              </h4>
              <div className="flex items-center justify-between text-[10px] text-gray-400 mt-auto">
                <span>{article.publishedAt}</span>
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
