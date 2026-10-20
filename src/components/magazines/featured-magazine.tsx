"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Download,
  Calendar,
  FileText,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { MagazineIssueItem } from "@/types/magazine";

interface FeaturedMagazineProps {
  magazine: MagazineIssueItem;
  onReadOnline: (magazine: MagazineIssueItem) => void;
}

export function FeaturedMagazine({
  magazine,
  onReadOnline,
}: FeaturedMagazineProps) {
  const shouldReduceMotion = useReducedMotion();

  const formattedDate = new Date(magazine.publicationDate).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    },
  );

  return (
    <section
      aria-label="Featured Magazine Edition"
      className="relative w-full rounded-3xl bg-linear-to-b from-gray-50/90 via-white to-gray-50/40 border border-gray-200/80 p-6 sm:p-10 lg:p-12 mb-12 shadow-sm overflow-hidden"
    >
      {/* Decorative Emerald Glow Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#00FF00]/15 blur-3xl -z-10"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: 3D Perspective Magazine Cover Showcase */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="lg:col-span-5 flex flex-col items-center justify-center relative"
        >
          {/* Subtle realistic ground shadow */}
          <div className="absolute -bottom-4 w-[75%] h-8 bg-black/20 blur-xl rounded-full pointer-events-none" />

          {/* Cover Container */}
          <div className="relative group w-full max-w-[320px] sm:max-w-90 aspect-3/4 rounded-2xl overflow-hidden shadow-2xl border border-gray-200/90 bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,255,0,0.25)]">
            <Image
              src={magazine.coverImage}
              alt={magazine.title}
              fill
              priority
              sizes="(max-width: 768px) 320px, 360px"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />

            {/* Subtle gloss overlay reflection */}
            <div className="absolute inset-0 bg-linear-to-tr from-black/20 via-transparent to-white/20 pointer-events-none" />

            {/* Floating pill badge on cover */}
            <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#00FF00] animate-pulse" />
              Latest Flagship Edition
            </div>
          </div>
        </motion.div>

        {/* Right Column: Editorial Details & Action Suite */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="lg:col-span-7 flex flex-col justify-center space-y-6"
        >
          {/* Edition Tag & Meta Chips */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {magazine.edition}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {formattedDate}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              {magazine.pageCount} Pages • {magazine.fileSize}
            </span>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#171717] tracking-tight leading-snug">
              {magazine.title}
            </h2>
            <p className="mt-3 text-gray-600 text-sm sm:text-base leading-relaxed">
              {magazine.description}
            </p>
          </div>

          {/* Key Editorial Highlights */}
          {magazine.highlights.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Inside this edition:
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-700">
                {magazine.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons Suite */}
          <div className="pt-3 flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Read Online Button */}
            <button
              type="button"
              onClick={() => onReadOnline(magazine)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read Online</span>
            </button>

            {/* Download PDF Button */}
            <a
              href={magazine.pdfAsset}
              download={`${magazine.slug}.pdf`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold bg-white hover:bg-gray-50 text-[#171717] border border-gray-300 shadow-2xs hover:border-gray-400 transition-all duration-200 cursor-pointer"
            >
              <Download className="w-4 h-4 text-gray-600" />
              <span>Download PDF</span>
            </a>

            {/* View Details Link */}
            <Link
              href={`/magazines/${magazine.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-3 text-xs font-bold text-gray-600 hover:text-black transition-colors"
            >
              <span>View Issue Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
