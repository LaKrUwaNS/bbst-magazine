"use client";

import React from "react";
import {
  FlaskConical,
  Sprout,
  Laptop,
  TrendingUp,
  GraduationCap,
  Users,
  Palette,
  MessageSquare,
  Award,
  Lightbulb,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { CategoryWithCount } from "@/types/article";

interface CategoriesWidgetProps {
  categories: CategoryWithCount[];
  selectedCategorySlug?: string;
  onSelectCategory: (categorySlug?: string) => void;
  showViewAll?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FlaskConical,
  Sprout,
  Laptop,
  TrendingUp,
  GraduationCap,
  Users,
  Palette,
  MessageSquare,
  Award,
  Lightbulb,
};

export function CategoriesWidget({
  categories,
  selectedCategorySlug,
  onSelectCategory,
  showViewAll = true,
}: CategoriesWidgetProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
        <h3 className="font-bold text-base text-[#171717]">Categories</h3>
        {showViewAll && (
          <button
            type="button"
            onClick={() => onSelectCategory(undefined)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#00C800] hover:text-[#00A800] transition-colors cursor-pointer"
          >
            View All
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Category List */}
      <ul className="space-y-1">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.iconName] || Lightbulb;
          const isSelected = selectedCategorySlug === cat.slug;

          return (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() =>
                  onSelectCategory(isSelected ? undefined : cat.slug)
                }
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-50 text-[#00A800] font-semibold"
                    : "text-gray-700 hover:bg-emerald-50/50 hover:text-black"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-[#00E500] text-[#171717]"
                        : "bg-emerald-50 text-[#00C800] group-hover:bg-emerald-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm truncate">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {cat.count} articles
                    </span>
                  </div>
                </div>

                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isSelected ? "text-[#00C800] translate-x-0.5" : "text-gray-300"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
