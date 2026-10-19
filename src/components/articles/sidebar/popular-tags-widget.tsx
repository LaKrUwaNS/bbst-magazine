"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface PopularTagsWidgetProps {
  tags: string[];
  selectedTag?: string;
  onSelectTag: (tag?: string) => void;
  showViewAll?: boolean;
}

export function PopularTagsWidget({
  tags,
  selectedTag,
  onSelectTag,
  showViewAll = true,
}: PopularTagsWidgetProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
        <h3 className="font-bold text-base text-[#171717]">Popular Tags</h3>
        {showViewAll && (
          <button
            type="button"
            onClick={() => onSelectTag(undefined)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#00C800] hover:text-[#00A800] transition-colors cursor-pointer"
          >
            View All
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Tags Cloud */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();

          return (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectTag(isSelected ? undefined : tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#00E500] text-[#171717] font-bold shadow-xs"
                  : "bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-[#00A800]"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
