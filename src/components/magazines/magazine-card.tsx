"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Download, Calendar, FileText, ArrowUpRight } from "lucide-react";
import { MagazineIssueItem } from "@/types/magazine";

interface MagazineCardProps {
  magazine: MagazineIssueItem;
  onReadOnline: (magazine: MagazineIssueItem) => void;
  isLatest?: boolean;
}

export function MagazineCard({
  magazine,
  onReadOnline,
  isLatest = false,
}: MagazineCardProps) {
  const formattedDate = new Date(magazine.publicationDate).toLocaleDateString(
    "en-US",
    {
      month: "short",
      year: "numeric",
    }
  );

  return (
    <article
      className={`group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border bg-white p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
        isLatest
          ? "border-[#00E500]/60 shadow-md ring-1 ring-[#00E500]/30"
          : "border-gray-200/90 shadow-2xs hover:border-[#00C800]/50"
      }`}
    >
      <div>
        {/* Cover Preview Area with Aspect Ratio 3:4 */}
        <div className="relative w-full aspect-3/4 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shadow-inner mb-5">
          <Image
            src={magazine.coverImage}
            alt={magazine.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />

          {/* Subtle gloss overlay reflection */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

          {/* Floating Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
            {isLatest ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00E500] text-black shadow-sm">
                Latest Issue
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20">
                {magazine.year}
              </span>
            )}

            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 text-gray-800 backdrop-blur-md shadow-2xs">
              {magazine.fileSize}
            </span>
          </div>

          {/* Bottom Cover Quick Overlay Action on Hover */}
          <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-center">
            <button
              type="button"
              onClick={() => onReadOnline(magazine)}
              className="w-full py-2.5 px-4 rounded-xl bg-black/85 hover:bg-black text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#00FF00]" />
              <span>Quick Read</span>
            </button>
          </div>
        </div>

        {/* Edition & Date Metadata */}
        <div className="flex items-center justify-between gap-2 text-xs text-gray-500 mb-2">
          <span className="font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 text-[11px]">
            {magazine.edition}
          </span>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Magazine Title with Link to Detail Page */}
        <h3 className="text-lg sm:text-xl font-bold text-[#171717] group-hover:text-emerald-800 transition-colors line-clamp-2">
          <Link href={`/magazines/${magazine.slug}`} className="hover:underline">
            {magazine.title}
          </Link>
        </h3>

        {/* Short Description */}
        <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed">
          {magazine.description}
        </p>

        {/* Highlights Preview */}
        {magazine.highlights.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Inside:
            </span>
            <p className="text-xs text-gray-700 line-clamp-1 italic mt-0.5">
              • {magazine.highlights[0]}
            </p>
          </div>
        )}
      </div>

      {/* Card Footer: Metadata + Primary Actions */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between gap-2 mb-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            <span>{magazine.pageCount} Pages</span>
          </div>
          <Link
            href={`/magazines/${magazine.slug}`}
            className="inline-flex items-center gap-0.5 font-bold text-gray-600 hover:text-black transition-colors"
          >
            <span>Overview</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Read Online Button */}
          <button
            type="button"
            onClick={() => onReadOnline(magazine)}
            className="w-full py-2.5 px-3 rounded-full text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Read Online</span>
          </button>

          {/* Download PDF Button */}
          <a
            href={magazine.pdfAsset}
            download={`${magazine.slug}.pdf`}
            className="w-full py-2.5 px-3 rounded-full text-xs font-bold bg-white hover:bg-gray-50 text-[#171717] border border-gray-200 shadow-2xs hover:border-gray-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-600" />
            <span>Download</span>
          </a>
        </div>
      </div>
    </article>
  );
}
