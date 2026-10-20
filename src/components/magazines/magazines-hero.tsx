"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Sparkles, Download, Layers } from "lucide-react";

interface MagazinesHeroProps {
  totalCount: number;
}

export function MagazinesHero({ totalCount }: MagazinesHeroProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative w-full rounded-2xl sm:rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-xs mb-8 lg:mb-12">
      {/* Ambient Radial Green Glow Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[#00FF00]/12 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 right-1/4 w-80 h-80 rounded-full bg-emerald-400/8 blur-3xl"
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center min-h-60 sm:min-h-70">
        {/* Left Column: Editorial Headline & University Narrative */}
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
                Uva Wellassa University Student Publications
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#171717] tracking-tight leading-tight">
              Explore Our <span className="text-[#00C800]">Magazines</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Immerse yourself in student research, technological innovations,
              fieldwork chronicles, and creative voices from the Faculty of
              Technological Studies. Read full editions online or download
              official PDF copies.
            </p>

            {/* Quick Publication Stats Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-gray-700">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200/80 shadow-2xs">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>{totalCount} Published Editions</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200/80 shadow-2xs">
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Original PDF Downloads</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200/80 shadow-2xs">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Archive (2023 – 2025)</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Campus Visual Atmosphere */}
        <div className="hidden sm:block lg:col-span-5 relative h-full min-h-65 lg:min-h-75 w-full overflow-hidden">
          <Image
            src="/images/articles-campus-hero.png"
            alt="BBST Student Publications Campus"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-cover object-center"
          />

          {/* Smooth linear blend overlay into the white background */}
          <div className="absolute inset-y-0 left-0 w-12 sm:w-16 bg-linear-to-r from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
