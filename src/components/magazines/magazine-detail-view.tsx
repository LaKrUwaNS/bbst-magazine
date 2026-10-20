"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Download,
  Calendar,
  FileText,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { MagazineIssueItem } from "@/types/magazine";
import { MagazineReaderModal } from "./magazine-reader-modal";

interface MagazineDetailViewProps {
  magazine: MagazineIssueItem;
}

export function MagazineDetailView({ magazine }: MagazineDetailViewProps) {
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  const formattedDate = new Date(magazine.publicationDate).toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumbs"
        className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-8"
      >
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/magazines" className="hover:text-black transition-colors">
          Magazines
        </Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-xs">{magazine.title}</span>
      </nav>

      {/* Main Two-Column Editorial Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Magazine Cover with 3D Depth */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-sm aspect-3/4 rounded-2xl overflow-hidden shadow-2xl border border-gray-200/90 bg-white group">
            <Image
              src={magazine.coverImage}
              alt={magazine.title}
              fill
              priority
              sizes="(max-width: 1024px) 380px, 460px"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            {/* Subtle gloss reflection */}
            <div className="absolute inset-0 bg-linear-to-tr from-black/20 via-transparent to-white/20 pointer-events-none" />
          </div>

          <p className="mt-4 text-xs text-gray-400 text-center">
            Official Publication • Faculty of Technological Studies, UWU
          </p>
        </div>

        {/* Right Column: Publication Metadata, Narrative & Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {magazine.edition}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {formattedDate}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              {magazine.pageCount} Pages • {magazine.fileSize}
            </span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight leading-tight">
              {magazine.title}
            </h1>
            <p className="mt-4 text-gray-600 text-base leading-relaxed">
              {magazine.description}
            </p>
          </div>

          {/* Editorial Highlights */}
          {magazine.highlights.length > 0 && (
            <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Key Articles &amp; Research Highlights:
              </h2>
              <ul className="space-y-2 text-sm text-gray-800">
                {magazine.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsReaderOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read Online Now</span>
            </button>

            <a
              href={magazine.pdfAsset}
              download={`${magazine.slug}.pdf`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold bg-white hover:bg-gray-50 text-[#171717] border border-gray-300 shadow-2xs hover:border-gray-400 transition-all duration-200 cursor-pointer"
            >
              <Download className="w-4 h-4 text-gray-600" />
              <span>Download PDF ({magazine.fileSize})</span>
            </a>

            <Link
              href="/magazines"
              className="inline-flex items-center gap-1.5 px-4 py-3 text-xs font-bold text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Magazines</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Reader Modal */}
      <MagazineReaderModal
        magazine={magazine}
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
      />
    </div>
  );
}
