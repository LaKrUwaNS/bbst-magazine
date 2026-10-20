"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Palette,
  BookOpenCheck,
  Microscope,
  Users,
  Smartphone,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

interface ValueItem {
  icon: React.ElementType;
  title: string;
  category: string;
  description: string;
  href?: string;
  badge: string;
}

const VALUES: ValueItem[] = [
  {
    icon: Palette,
    title: "Student Creativity",
    category: "Expression & Arts",
    description:
      "A dedicated canvas for student poetry, photography, personal memoirs, and original artwork. We celebrate the unique perspectives that define our campus culture.",
    href: "/categories/arts-literature",
    badge: "Voice & Art",
  },
  {
    icon: BookOpenCheck,
    title: "Knowledge Sharing",
    category: "Academic Dialogue",
    description:
      "Demystifying complex concepts across disciplines. We make scientific breakthroughs, economic analyses, and philosophical debates accessible to all readers.",
    href: "/categories",
    badge: "Open Learning",
  },
  {
    icon: Microscope,
    title: "Research & Innovation",
    category: "Applied Discoveries",
    description:
      "Showcasing undergraduate capstones, laboratory trials, biosystems advancements, and tech prototypes that demonstrate real-world value addition.",
    href: "/categories/science-research",
    badge: "UWU Research",
  },
  {
    icon: Users,
    title: "Community Connection",
    category: "Campus Belonging",
    description:
      "Connecting undergraduates across all academic faculties, lecturers, alumni, and external partners into an inspiring network of continuous collaboration.",
    href: "/articles",
    badge: "Interconnected",
  },
  {
    icon: Smartphone,
    title: "Digital Accessibility",
    category: "Modern Reading",
    description:
      "An interactive online reading platform featuring seamless flip-through reader modals, downloadable archival PDFs, and mobile-optimized typography.",
    href: "/magazines",
    badge: "Always Available",
  },
];

export function AboutValues() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Our Pillars
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#171717] tracking-tight">
              What Makes BBST Magazine <span className="text-[#00C800]">Special?</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              We combine journalistic integrity, scientific rigor, and student passion
              to deliver a reading experience that stands apart from typical university newsletters.
            </p>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 hover:text-emerald-700 group transition-colors shrink-0"
          >
            <span>Explore All Publication Categories</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#00C800]" />
          </Link>
        </div>

        {/* 5-Item Asymmetrical Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {VALUES.map((val, index) => {
            const Icon = val.icon;
            // First item spans 2 cols on lg screens for an editorial magazine layout
            const isFeatured = index === 0;

            return (
              <motion.div
                key={val.title}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                className={`group relative p-8 rounded-3xl border border-gray-200/80 bg-white hover:border-[#00C800] hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                  isFeatured ? "md:col-span-2 lg:col-span-2 bg-linear-to-br from-emerald-50/30 via-white to-white" : ""
                }`}
              >
                {/* Top header row */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shadow-2xs group-hover:scale-105 group-hover:bg-[#00E500] group-hover:text-black transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {val.badge}
                    </span>
                  </div>

                  {/* Category Eyebrow */}
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                    {val.category}
                  </p>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight group-hover:text-emerald-800 transition-colors mb-3">
                    {val.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed font-normal">
                    {val.description}
                  </p>
                </div>

                {/* Bottom link */}
                {val.href && (
                  <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      href={val.href}
                      className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 group-hover:text-[#00C800] transition-colors"
                    >
                      <span>Explore this theme</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                    <span className="text-xs font-black text-gray-300 group-hover:text-emerald-400 transition-colors">
                      0{index + 1}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
