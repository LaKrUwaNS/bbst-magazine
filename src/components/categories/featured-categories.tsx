"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { CategoryDetailItem } from "@/types/category";
import { CategoryIcon } from "./category-icon";

interface FeaturedCategoriesProps {
  categories: CategoryDetailItem[];
}

const FEATURED_TAGS: Record<string, string[]> = {
  "technology-innovation": ["Artificial Intelligence", "Robotics", "Smart IoT"],
  "agriculture-environment": [
    "Climate Resilience",
    "Sustainable Agri",
    "Eco-Systems",
  ],
  "science-research": [
    "Biochemistry",
    "Lab Dissertations",
    "Analytical Research",
  ],
  "business-entrepreneurship": [
    "Campus Startups",
    "Incubators",
    "Agri-Ventures",
  ],
};

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  const shouldReduceMotion = useReducedMotion();

  if (categories.length === 0) return null;

  return (
    <section aria-label="Featured Categories" className="relative mb-14">
      {/* Subtle Ambient Emerald Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 left-1/4 w-96 h-96 rounded-full bg-[#00FF00]/10 blur-3xl -z-10"
      />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 w-fit mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00E500]" />
            <span>Spotlight Academic Domains</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            Featured Categories
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm">
          Core undergraduate research fields driving biosystems innovation,
          environmental stewardship, and creative inquiry.
        </p>
      </div>

      {/* Featured Grid (2 cols on tablet, 4 cols on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, index) => {
          const tags = FEATURED_TAGS[cat.slug] || [
            "Research",
            "Student Projects",
            "Editorial",
          ];

          return (
            <motion.div
              key={cat.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: shouldReduceMotion ? 0 : index * 0.08,
                ease: "easeOut",
              }}
              className="h-full"
            >
              <Link
                href={`/articles?category=${cat.slug}`}
                className="group relative flex flex-col justify-between h-full rounded-2xl sm:rounded-3xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-[#00C800]/60 cursor-pointer"
              >
                <div>
                  {/* Top Image Banner with Crisp 16:10 Aspect Ratio */}
                  <div className="relative w-full aspect-16/10 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-5 shadow-inner">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-108"
                    />

                    {/* Clean Gradient Scrim at bottom of image for contrast */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />

                    {/* Floating Top Left: Icon Badge */}
                    <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border border-white/60 flex items-center justify-center text-emerald-800 shadow-sm transition-transform duration-300 group-hover:scale-110">
                      <CategoryIcon
                        name={cat.iconName}
                        className="w-5 h-5 text-emerald-700"
                      />
                    </div>

                    {/* Floating Top Right: Article Count Badge in Bright BBST Green */}
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#00E500] text-[#171717] shadow-sm">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{cat.articleCount} Articles</span>
                    </div>

                    {/* Bottom-left eyebrow chip on image */}
                    <div className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur-md">
                      <Sparkles className="w-3 h-3 text-[#00FF00]" />
                      <span>Featured Domain</span>
                    </div>
                  </div>

                  {/* Category Title */}
                  <h3 className="text-xl font-bold text-[#171717] group-hover:text-emerald-800 transition-colors tracking-tight leading-snug">
                    {cat.name}
                  </h3>

                  {/* Category Description */}
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Sub-topic Tag Pills */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-medium text-gray-600 bg-gray-100/80 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Explore Action Link with Circular Button */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-700 group-hover:text-emerald-800 transition-colors">
                  <span>Explore Articles</span>
                  <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#00E500] border border-gray-200 group-hover:border-[#00D000] flex items-center justify-center text-gray-600 group-hover:text-black transition-all">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
