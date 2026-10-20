"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SearchX, RotateCcw } from "lucide-react";
import { CategoryDetailItem } from "@/types/category";
import { CategoryCard } from "./category-card";

interface CategoriesGridProps {
  categories: CategoryDetailItem[];
  onResetSearch: () => void;
}

export function CategoriesGrid({
  categories,
  onResetSearch,
}: CategoriesGridProps) {
  const shouldReduceMotion = useReducedMotion();

  if (categories.length === 0) {
    return (
      <div className="text-center py-20 px-6 rounded-3xl bg-gray-50/70 border border-dashed border-gray-200 max-w-2xl mx-auto my-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto text-emerald-700 shadow-2xs">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-[#171717]">
          No matching categories found
        </h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
          We couldn&apos;t find any categories matching your current search query.
          Try searching for keywords like &quot;Research&quot;, &quot;Technology&quot;, or &quot;Agriculture&quot;.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onResetSearch}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Search Filter</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((cat, index) => (
        <motion.div
          key={cat.id}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: shouldReduceMotion ? 0 : Math.min(index * 0.05, 0.3),
            ease: "easeOut",
          }}
        >
          <CategoryCard category={cat} />
        </motion.div>
      ))}
    </div>
  );
}
