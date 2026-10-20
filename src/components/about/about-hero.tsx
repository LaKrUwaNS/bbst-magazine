"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, Sparkles, MapPin } from "lucide-react";

interface AboutHeroProps {
  totalMagazines: number;
  totalArticles: number;
}

export function AboutHero({ totalMagazines, totalArticles }: AboutHeroProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section className="relative w-full overflow-hidden border-b border-gray-100 bg-linear-to-b from-gray-50/70 via-white to-white pt-10 sm:pt-14 pb-16 lg:pb-24">
      {/* Ambient Radial Emerald Glow Accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#00FF00]/12 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl"
      />

      {/* Subtle Floating Leaves in Hero margins */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0 opacity-80"
      >
        <div className="absolute top-12 left-4 w-10 sm:w-12 aspect-square drop-shadow-xs -rotate-45">
          <Image
            src="/images/Leaf1.png"
            alt=""
            fill
            sizes="48px"
            className="object-contain"
          />
        </div>
        <div className="absolute top-28 right-8 w-11 sm:w-14 aspect-square drop-shadow-xs rotate-30 hidden sm:block">
          <Image
            src="/images/Leaf2.png"
            alt=""
            fill
            sizes="56px"
            className="object-contain"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Narrative */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col justify-center space-y-6"
          >
            {/* Eyebrow Pill */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-50 border border-emerald-200 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                BBST Student Magazine • Uva Wellassa University
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div variants={itemVariants} className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#171717] tracking-tight leading-[1.08]">
                Stories That Inspire. <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00C800] via-emerald-600 to-teal-700">
                  Ideas That Shape the Future.
                </span>
              </h1>
            </motion.div>

            {/* Supporting Text */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl font-normal"
            >
              Discover the creativity, knowledge, research, and stories that bring the
              BBST student community to life at Uva Wellassa University.
            </motion.p>

            {/* Handwritten Cursive Editorial Flourish */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3 pt-1 text-emerald-800"
            >
              <span
                className="text-xl sm:text-2xl font-bold font-caveat select-none"
                style={{
                  fontFamily: "var(--font-caveat), 'Caveat', cursive, sans-serif",
                }}
              >
                &ldquo;Where undergraduate curiosity meets impactful storytelling.&rdquo;
              </span>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <Link
                href="/magazines"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-sm transition-all hover:scale-[1.02] active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Our Magazines</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>

              <a
                href="#our-story"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 shadow-2xs transition-all hover:text-black"
              >
                <span>Read Our Story</span>
              </a>
            </motion.div>

            {/* Quick Metrics Badges */}
            <motion.div
              variants={itemVariants}
              className="pt-4 flex flex-wrap items-center gap-6 text-xs text-gray-500 border-t border-gray-100"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00E500]" />
                <span className="font-bold text-gray-900">{totalMagazines}+</span>
                <span>Published Issues</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-gray-900">{totalArticles}+</span>
                <span>Editorial Articles</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Badulla, Sri Lanka</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Layered Editorial Visual Composition */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
            className="lg:col-span-5 relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md">
              {/* Backing Campus Atmosphere Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100 aspect-4/5">
                <Image
                  src="/images/articles-campus-hero.png"
                  alt="Uva Wellassa University Campus"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                {/* Campus Location Badge on bottom of background image */}
                <div className="absolute bottom-4 left-4 right-4 text-white p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Uva Wellassa University of Sri Lanka
                  </p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    Faculty of Applied Sciences &amp; Biosystems Technology
                  </p>
                </div>
              </div>

              {/* Overlapping Floating 3D Magazine Cover Card */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, x: 24, y: 24 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
                className="absolute -bottom-8 -left-6 sm:-left-10 w-44 sm:w-52 aspect-3/4 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white rotate-[-4deg] hover:rotate-0 transition-transform duration-300"
              >
                <Image
                  src="/images/Magazine.png"
                  alt="BBST Student Magazine Cover"
                  fill
                  sizes="210px"
                  className="object-contain"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00E500] text-black shadow-xs">
                  Latest Issue
                </div>
              </motion.div>

              {/* Floating Verified Badge */}
              <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md border border-gray-100 shadow-lg rounded-2xl px-4 py-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black text-xs">
                  UWU
                </div>
                <div>
                  <p className="text-xs font-bold text-[#171717]">Student Publication</p>
                  <p className="text-[11px] text-gray-500">Official Editorial Platform</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
