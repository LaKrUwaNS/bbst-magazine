"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronDown, Users, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { MagazineMockup } from "@/components/magazine-mockup";
import { CategoryStrip } from "@/components/category-strip";
import { FloatingLeaves } from "@/components/floating-leaves";
import { SubmitArticleDialog } from "@/components/submit-article-dialog";
import {
  HeroStagger,
  HeroItem,
  HeroFadeIn,
  AnimatedStat,
} from "@/components/hero-animations";

interface HeroSectionProps {
  latestMagazineHref: string;
  latestMagazineTitle: string | null;
  latestMagazineSlug: string | null;
  displayArticlesCount: string;
  displayContributorsCount: string;
  displayMagazinesCount: string;
}

export function HeroSection({
  latestMagazineHref,
  latestMagazineTitle,
  latestMagazineSlug,
  displayArticlesCount,
  displayContributorsCount,
  displayMagazinesCount,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[calc(100vh-70px)] flex flex-col justify-between pt-4 sm:pt-6 pb-6 sm:pb-8 overflow-hidden">
      {/* Background Image: Aerial Uva Wellassa University Campus */}
      <div className="absolute inset-0 -z-20 pointer-events-none select-none overflow-hidden">
        <Image
          src="/uva-imageee.jpg"
          alt="Uva Wellassa University Campus"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center blur-[3px] scale-105"
        />
        {/* Soft gradient overlay for text readability while letting vibrant campus scenery shine */}
        <div className="absolute inset-0 bg-linear-to-r from-white/80 via-white/55 to-white/20 pointer-events-none" />
        <div className="absolute inset-0 bg-linear-to-t from-white/50 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Floating & Falling Realistic Green Leaves — Framer Motion */}
      <FloatingLeaves />

      {/* Main Two-Column Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 my-auto py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
          {/* Left Column: Bold Headline & Editorial Narrative */}
          <HeroStagger
            className="lg:col-span-6 space-y-6 sm:space-y-7 text-left"
            delay={0.15}
            stagger={0.14}
          >
            {/* Eyebrow Tagline: IDEAS | PEOPLE | INNOVATION | OUR UNIVERSITY */}
            <HeroItem>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold tracking-[0.2em] text-[#00C800] uppercase">
                <span>IDEAS</span>
                <span className="text-gray-300">|</span>
                <span>PEOPLE</span>
                <span className="text-gray-300">|</span>
                <span>INNOVATION</span>
                <span className="text-gray-300">|</span>
                <span>OUR UNIVERSITY</span>
              </div>
            </HeroItem>

            {/* Main Headline: Exactly two balanced lines on desktop */}
            <HeroItem>
              <h1 className="text-4xl sm:text-5xl lg:text-[46px] xl:text-[54px] 2xl:text-[58px] font-black text-[#171717] tracking-tight leading-[1.08] max-w-xl">
                <span className="block">Student Voices</span>
                <span className="block mt-1 sm:mt-1.5">
                  <span className="text-[#171717]">for a </span>
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00C800] via-[#00E500] to-[#00B800] drop-shadow-[0_2px_12px_rgba(0,255,0,0.18)]">
                    Brighter Tomorrow
                  </span>
                </span>
              </h1>
            </HeroItem>

            {/* Editorial Description */}
            <HeroItem>
              <p className="text-base sm:text-lg text-gray-700 max-w-lg leading-relaxed font-normal">
                BBST Student Magazine is a platform for creativity, research,
                innovation and stories from our university community.
              </p>
            </HeroItem>

            {/* CTA Buttons */}
            <HeroItem>
              <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-1">
                <motion.div
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="/articles"
                    className="inline-flex items-center gap-2 px-7 sm:px-8 py-3.5 rounded-full bg-[#00E500] hover:bg-[#00D000] text-black font-bold text-sm sm:text-base shadow-md hover:shadow-[0_10px_25px_-5px_rgba(0,229,0,0.5)] transition-shadow group cursor-pointer"
                  >
                    <span>Explore Articles</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={latestMagazineHref}
                    className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-full bg-white/95 hover:bg-white text-[#171717] font-bold text-sm sm:text-base border border-gray-200/90 shadow-xs hover:shadow-md transition-shadow group"
                  >
                    <BookOpen className="w-5 h-5 text-[#00E500]" />
                    <span>Latest Issue</span>
                  </Link>
                </motion.div>
              </div>
            </HeroItem>

            {/* Contributor Avatar Stack & Join Community Tag */}
            <HeroItem>
              <div className="flex items-center gap-3.5 pt-2">
                <div className="flex -space-x-2.5 overflow-visible">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="relative w-9 h-9 rounded-full border-2 border-white shadow-xs overflow-hidden cursor-pointer"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.25, zIndex: 20 }}
                      transition={{
                        duration: 0.35,
                        delay: 0.8 + i * 0.08,
                        ease: [0.22, 1, 0.36, 1] as const,
                      }}
                    >
                      <Image
                        src={`/images/avatar${i}.jpg`}
                        alt="Student Writer"
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 leading-tight">
                  Join a growing community of
                  <br />
                  <strong className="text-[#171717] font-bold">
                    student writers and creators.
                  </strong>
                </p>
              </div>
            </HeroItem>
          </HeroStagger>

          {/* Right Column: 3D Magazine Cover Mockup with Handwritten Annotation & Floating Badges */}
          <div className="lg:col-span-6 flex justify-center items-center relative w-full">
            <MagazineMockup
              coverUrl="/images/Magazine.png"
              title={
                latestMagazineTitle || "BBST Student Magazine — Vol 02 / 2025"
              }
              slug={latestMagazineSlug}
            />
          </div>
        </div>
      </div>

      {/* Floating Category Strip Component */}
      <div className="w-full z-20 mt-4 mb-4">
        <CategoryStrip />
      </div>

      {/* ======================================================== */}
      {/* BOTTOM ROW: Statistics, Scroll Indicator, and CTA       */}
      {/* ======================================================== */}
      <div className="w-full z-10 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 py-4 px-2 sm:px-4">
            {/* Publication Statistics Row */}
            <div className="flex items-center gap-8 sm:gap-12">
              <AnimatedStat
                label="Articles Published"
                value={displayArticlesCount}
                icon={<BookOpen className="w-7 h-7 stroke-2" />}
                delay={1.1}
              />
              <AnimatedStat
                label="Student Contributors"
                value={displayContributorsCount}
                icon={<Users className="w-7 h-7 stroke-2" />}
                delay={1.25}
              />
              <div className="hidden sm:block">
                <AnimatedStat
                  label="Magazine Editions"
                  value={displayMagazinesCount}
                  icon={<Trophy className="w-7 h-7 stroke-2" />}
                  delay={1.4}
                />
              </div>
            </div>

            {/* Scroll Down Indicator */}
            <HeroFadeIn
              className="hidden md:flex flex-col items-center text-gray-500 cursor-pointer"
              delay={1.5}
            >
              <div className="w-5 h-8 rounded-full border-2 border-gray-400 flex items-start justify-center p-1">
                <motion.div
                  className="w-1.5 h-2 rounded-full bg-gray-500"
                  animate={{ y: [0, 8, 0], opacity: [0.6, 1, 0.4] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <span className="text-[10px] font-semibold text-gray-600 mt-1">
                Scroll Down
              </span>
              <motion.div
                animate={{ y: [0, 3, 0] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 -mt-0.5" />
              </motion.div>
            </HeroFadeIn>

            {/* Contributor Imagery & Submit Your Article CTA */}
            <HeroFadeIn
              className="flex items-center gap-6"
              delay={1.3}
              direction="right"
            >
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex -space-x-2.5 overflow-visible">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.25, zIndex: 20 }}
                      className="relative w-8 h-8 rounded-full border-2 border-white shadow-xs overflow-hidden cursor-pointer"
                    >
                      <Image
                        src={`/images/avatar${i}.jpg`}
                        alt="Contributor"
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
                <div className="text-right text-xs">
                  <span className="block font-bold text-[#171717]">
                    Be Part of the Story
                  </span>
                  <span className="text-gray-500 text-[11px]">
                    Write. Share. Inspire.
                  </span>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <SubmitArticleDialog triggerClassName="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-[#00E500] hover:bg-[#00D000] text-black transition-all shadow-sm hover:shadow-[0_8px_20px_-4px_rgba(0,229,0,0.5)] group cursor-pointer">
                  <span>Submit Your Article</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </SubmitArticleDialog>
              </motion.div>
            </HeroFadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
