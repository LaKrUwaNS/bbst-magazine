"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export function ArticlesHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative w-full rounded-2xl sm:rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-xs mb-8 lg:mb-10">
      {/* Subtle Ambient Green Glow Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -left-12 w-64 h-64 rounded-full bg-[#00FF00]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 left-1/3 w-72 h-72 rounded-full bg-emerald-400/8 blur-3xl"
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center min-h-[220px] sm:min-h-[260px] lg:min-h-[280px]">
        {/* Left Column: Editorial Headline & Narrative */}
        <div className="lg:col-span-7 z-10 px-6 sm:px-10 lg:px-12 py-8 sm:py-10 flex flex-col justify-center">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="space-y-3"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2">
              <span className="text-xs sm:text-xs font-bold uppercase tracking-[0.2em] text-[#00C800]">
                EXPLORE | LEARN | GET INSPIRED
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#171717] tracking-tight leading-tight">
              All <span className="text-[#00C800]">Articles</span>
            </h1>

            {/* Narrative Subtitle */}
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Discover stories, research, ideas and perspectives from the BBST student community.
            </p>
          </motion.div>
        </div>

        {/* Right Column: Crystal Clear Campus Architecture Panorama */}
        <div className="hidden sm:block lg:col-span-5 relative h-full min-h-[250px] lg:min-h-[290px] w-full overflow-hidden">
          <Image
            src="/images/articles-campus-hero.png"
            alt="BBST University Campus Architecture"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-cover object-center"
          />

          {/* Clean, subtle 20px edge blend on the left so the photo remains crystal clear and vibrant */}
          <div className="absolute inset-y-0 left-0 w-8 sm:w-14 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
