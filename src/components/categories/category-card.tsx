"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { CategoryDetailItem } from "@/types/category";
import { CategoryIcon } from "./category-icon";

interface CategoryCardProps {
  category: CategoryDetailItem;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <article className="group h-full">
      <Link
        href={`/articles?category=${category.slug}`}
        className="flex flex-col justify-between h-full rounded-2xl sm:rounded-3xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-[#00C800]/60 cursor-pointer"
      >
        <div>
          {/* Category Image Banner with 16:9 Aspect Ratio */}
          <div className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-5 shadow-inner">
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-108"
            />

            {/* Subtle gloss scrim */}
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

            {/* Floating Icon Pill */}
            <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md border border-white/40 flex items-center justify-center text-emerald-800 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <CategoryIcon
                name={category.iconName}
                className="w-4 h-4 text-emerald-700"
              />
            </div>

            {/* Floating Article Count Badge */}
            <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#00E500] text-[#171717] shadow-xs">
              <BookOpen className="w-3 h-3 text-[#171717]" />
              <span>{category.articleCount} Articles</span>
            </div>
          </div>

          {/* Category Name */}
          <h3 className="text-lg sm:text-xl font-bold text-[#171717] group-hover:text-emerald-800 transition-colors line-clamp-1">
            {category.name}
          </h3>

          {/* Description */}
          <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {category.description}
          </p>
        </div>

        {/* Card Footer: Explore Action Link */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-700 group-hover:text-emerald-800 transition-colors">
          <span>View Published Articles</span>
          <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200 group-hover:bg-[#00E500] group-hover:border-[#00D000] flex items-center justify-center text-gray-600 group-hover:text-black transition-all">
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    </article>
  );
}
