"use client";

import React from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Eye,
  Tag,
  ChevronRight,
  Home,
} from "lucide-react";
import { Article } from "@/types/article";
import { ArticleShareActions } from "./article-share-actions";
import { ArticleAuthorCard } from "./article-author-card";
import { RelatedArticles } from "./related-articles";

interface ArticleDetailContentProps {
  article: Article;
  relatedArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onNavigateCategory?: (categorySlug: string) => void;
}

export function ArticleDetailContent({
  article,
  relatedArticles,
  onSelectArticle,
  onNavigateCategory,
}: ArticleDetailContentProps) {
  // Format title with highlighted keyword if available
  const renderTitle = () => {
    if (!article.titleHighlight) return article.title;
    const parts = article.title.split(article.titleHighlight);
    if (parts.length === 2) {
      return (
        <>
          {parts[0]}
          <span className="text-[#00C800]">{article.titleHighlight}</span>
          {parts[1]}
        </>
      );
    }
    return article.title;
  };

  return (
    <article className="w-full">
      {/* 1. Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center flex-wrap gap-1.5 text-xs text-gray-400 mb-4"
      >
        <span className="inline-flex items-center gap-1 hover:text-black transition-colors">
          <Home className="w-3 h-3" />
          <span>Home</span>
        </span>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="hover:text-black transition-colors">Articles</span>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <button
          type="button"
          onClick={() => onNavigateCategory?.(article.category.slug)}
          className="hover:text-[#00A800] transition-colors cursor-pointer"
        >
          {article.category.name}
        </button>
        <ChevronRight className="w-3 h-3 text-gray-300 hidden sm:inline" />
        <span className="text-gray-600 truncate max-w-[200px] hidden sm:inline">
          {article.title}
        </span>
      </nav>

      {/* 2. Category Pill Badge */}
      <div className="mb-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#00E500] text-[#171717]">
          {article.category.name}
        </span>
      </div>

      {/* 3. Article Headline */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#171717] tracking-tight leading-tight mb-4">
        {renderTitle()}
      </h1>

      {/* 4. Lead Excerpt / Summary */}
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 font-normal">
        {article.excerpt}
      </p>

      {/* 5. Author & Metadata Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-gray-100 text-xs text-gray-500 mb-6">
        {/* Author info */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
            <Image
              src={article.author.avatar}
              alt={article.author.name}
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-bold text-[#171717] text-xs sm:text-sm">
              {article.author.name}
            </div>
            <div className="text-[11px] text-gray-400">
              {article.author.department}
            </div>
          </div>
        </div>

        {/* Date, Read time, Views */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{article.publishedAt}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{article.readTime}</span>
          </div>

          {article.views && (
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>{article.views}</span>
            </div>
          )}
        </div>
      </div>

      {/* 6. Large Featured Image */}
      <div className="relative w-full aspect-16/9 sm:h-[380px] rounded-2xl overflow-hidden bg-gray-100 mb-8 border border-gray-100 shadow-2xs">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 800px"
          className="object-cover"
        />
      </div>

      {/* 7. Structured Long-Form Content Sections */}
      <div className="space-y-6 text-[#171717]">
        {article.sections.map((section) => (
          <div key={section.id} className="space-y-3">
            {/* Heading with Green Vertical Accent */}
            <div className="flex items-center gap-2.5 pt-2">
              <span className="w-1.5 h-5 rounded-full bg-[#00E500] shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-[#171717]">
                {section.heading}
              </h2>
            </div>

            {/* Paragraphs */}
            {section.content.map((p, idx) => (
              <p
                key={idx}
                className="text-sm sm:text-[15px] text-gray-700 leading-relaxed"
              >
                {p}
              </p>
            ))}

            {/* Blockquote if present */}
            {section.quote && (
              <blockquote className="my-4 p-4 rounded-xl bg-emerald-50/60 border-l-4 border-[#00E500] text-gray-800 italic text-xs sm:text-sm">
                <p className="mb-1">&ldquo;{section.quote.text}&rdquo;</p>
                {section.quote.author && (
                  <cite className="not-italic text-[11px] font-bold text-gray-600 block">
                    — {section.quote.author}
                  </cite>
                )}
              </blockquote>
            )}
          </div>
        ))}
      </div>

      {/* 8. Tags Pills Row */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-8 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mr-1">
            <Tag className="w-3.5 h-3.5 text-[#00C800]" />
            <span>Tags:</span>
          </div>
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-xs bg-gray-50 text-gray-600 border border-gray-100"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 9. Social Share Actions */}
      <ArticleShareActions title={article.title} slug={article.slug} />

      {/* 10. Author Information Card */}
      <ArticleAuthorCard author={article.author} />

      {/* 11. Related Articles Showcase */}
      <RelatedArticles
        articles={relatedArticles}
        onSelectArticle={onSelectArticle}
      />
    </article>
  );
}
