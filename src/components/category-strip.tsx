"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FlaskConical,
  Sprout,
  Laptop,
  TrendingUp,
  GraduationCap,
  Users,
  Palette,
  MessageSquare,
  Trophy,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const CATEGORY_ITEMS = [
  {
    name: "Science & Research",
    lines: ["Science &", "Research"],
    slug: "science-research",
    icon: FlaskConical,
  },
  {
    name: "Agriculture & Environment",
    lines: ["Agriculture &", "Environment"],
    slug: "agriculture-environment",
    icon: Sprout,
  },
  {
    name: "Technology & Innovation",
    lines: ["Technology &", "Innovation"],
    slug: "technology-innovation",
    icon: Laptop,
  },
  {
    name: "Business & Entrepreneurship",
    lines: ["Business &", "Entrepreneurship"],
    slug: "business-entrepreneurship",
    icon: TrendingUp,
  },
  {
    name: "Education & Career",
    lines: ["Education &", "Career"],
    slug: "education-career",
    icon: GraduationCap,
  },
  {
    name: "Society & Culture",
    lines: ["Society &", "Culture"],
    slug: "society-culture",
    icon: Users,
  },
  {
    name: "Arts & Literature",
    lines: ["Arts &", "Literature"],
    slug: "arts-literature",
    icon: Palette,
  },
  {
    name: "Interviews & Opinions",
    lines: ["Interviews &", "Opinions"],
    slug: "interviews-opinions",
    icon: MessageSquare,
  },
  {
    name: "University Life & Achievements",
    lines: ["University Life &", "Achievements"],
    slug: "university-life-achievements",
    icon: Trophy,
  },
  {
    name: "Projects & Inventions",
    lines: ["Projects &", "Inventions"],
    slug: "projects-inventions",
    icon: Lightbulb,
  },
];

const stripContainerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.8,
      ease: [0.22, 1, 0.36, 1] as const,
      staggerChildren: 0.06,
      delayChildren: 1.0,
    },
  },
};

const categoryItemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function CategoryStrip() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <motion.section
      aria-label="Browse Categories"
      className="w-full"
      variants={stripContainerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Floating Rounded Panel with Soft Shadow */}
        <div className="relative rounded-3xl bg-white/95 backdrop-blur-md shadow-xl border border-gray-100/90 py-5 px-4 sm:px-6 flex items-center gap-3">
          {/* Scroll Left Button */}
          <motion.button
            type="button"
            onClick={() => scroll("left")}
            whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
            whileTap={{ scale: 0.92 }}
            aria-label="Scroll categories left"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black shrink-0 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          {/* Categories Grid / Horizontal Scroll */}
          <div
            ref={scrollRef}
            className="flex-1 flex items-start justify-between gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-1"
          >
            {CATEGORY_ITEMS.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.slug}
                  variants={categoryItemVariants}
                  whileHover={{ y: -4, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={`/articles?category=${cat.slug}`}
                    className="group flex flex-col items-center justify-start shrink-0 w-20 sm:w-24 text-center cursor-pointer"
                  >
                    {/* Icon Box in Soft Green */}
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50/90 text-emerald-600 group-hover:bg-[#00E500]/25 group-hover:text-emerald-900 group-hover:shadow-[0_4px_14px_-2px_rgba(0,229,0,0.4)] flex items-center justify-center mb-2.5 transition-all shadow-2xs">
                      <Icon className="w-5 h-5 stroke-2 group-hover:scale-110 transition-transform duration-200" />
                    </div>

                    {/* Centered Two-Line Label */}
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-800 group-hover:text-black leading-tight text-center transition-colors">
                      {cat.lines[0]}
                      <br />
                      {cat.lines[1]}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <motion.button
            type="button"
            onClick={() => scroll("right")}
            whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
            whileTap={{ scale: 0.92 }}
            aria-label="Scroll categories right"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black shrink-0 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}
