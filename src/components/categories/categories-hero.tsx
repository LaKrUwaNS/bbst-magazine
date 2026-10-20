"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Search, X, Sparkles, BookOpen, Layers } from "lucide-react";

interface CategoriesHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCategories: number;
  totalArticles: number;
}

export function CategoriesHero({
  searchQuery,
  onSearchChange,
  totalCategories,
  totalArticles,
}: CategoriesHeroProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative w-full rounded-2xl sm:rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-xs mb-8 lg:mb-12">
      {/* Ambient Radial Emerald Glow Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[#00FF00]/12 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 right-1/4 w-80 h-80 rounded-full bg-emerald-400/8 blur-3xl"
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center min-h-62.5 sm:min-h-72.5">
        {/* Left Column: Heading, Supporting Narrative, and Search Bar */}
        <div className="lg:col-span-7 z-10 px-6 sm:px-10 lg:px-12 py-8 sm:py-10 flex flex-col justify-center">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="space-y-4"
          >
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Editorial Topics &amp; Fields of Inquiry
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#171717] tracking-tight leading-tight">
              Explore <span className="text-[#00C800]">Categories</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Discover ideas, stories, research, and creative work from the BBST
              student community across science, biosystems, engineering, and
              campus life.
            </p>

            {/* Search Input Box */}
            <div className="pt-2 max-w-md">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search categories..."
                  aria-label="Search categories"
                  className="w-full pl-10 pr-9 py-2.5 text-sm rounded-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#00C800] focus:ring-2 focus:ring-[#00FF00]/20 outline-none transition-all placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-700">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200/80 shadow-2xs">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>{totalCategories} Curated Domains</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200/80 shadow-2xs">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>{totalArticles}+ Published Articles</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Campus Scenic Atmosphere */}
        <div className="hidden sm:block lg:col-span-5 relative h-full min-h-65 lg:min-h-75 w-full overflow-hidden">
          <Image
            src="/images/articles-campus-hero.png"
            alt="BBST Student Research Fields"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-cover object-center"
          />

          {/* Smooth linear blend overlay */}
          <div className="absolute inset-y-0 left-0 w-12 sm:w-16 bg-linear-to-r from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
