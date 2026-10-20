"use client";

import React from "react";
import {
  Archive,
  ArrowRight,
  Sparkles,
  Send,
} from "lucide-react";
import { SubmitArticleDialog } from "@/components/submit-article-dialog";

export function MagazineArchiveSection() {
  return (
    <section className="mt-16 pt-12 border-t border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Historical Archive & Heritage (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-linear-to-br from-gray-50 via-white to-gray-50 border border-gray-200/80 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Archive className="w-3.5 h-3.5 text-emerald-600" />
              <span>Publication Heritage &amp; Archives</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
              Preserving University Scholarship Since 2023
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed">
              Every edition of BBST Student Magazine documents the evolution of
              scientific research, agricultural innovations, and student
              perspectives across the Faculty of Technological Studies. Our digital
              archives are openly accessible to students, researchers, alumni,
              and global academic partners.
            </p>
          </div>

          {/* Heritage Key Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-center">
            <div className="p-3 rounded-2xl bg-white border border-gray-100 shadow-2xs">
              <span className="block text-xl sm:text-2xl font-black text-[#171717]">
                3+
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Years Active
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-gray-100 shadow-2xs">
              <span className="block text-xl sm:text-2xl font-black text-[#171717]">
                250+
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Total Pages
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-gray-100 shadow-2xs">
              <span className="block text-xl sm:text-2xl font-black text-[#171717]">
                100%
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Open Access
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Call for Submissions for Upcoming Issue (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#171717] text-white p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-lg">
          {/* Subtle Ambient Emerald Flare */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-[#00FF00]/20 blur-3xl"
          />

          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-[#00FF00] border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-[#00FF00]" />
              <span>Next Edition Open</span>
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight">
              Call for Submissions — Volume 03 / 2026
            </h3>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Are you an undergraduate or postgraduate student working on
              breakthrough bio-systems, agro-robotics, software, or campus
              journalism? Submit your article for our next printed and digital
              annual issue.
            </p>
          </div>

          <div className="pt-2 relative z-10">
            <SubmitArticleDialog triggerClassName="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black transition-all hover:scale-[1.02] shadow-md cursor-pointer">
              <Send className="w-4 h-4" />
              <span>Submit Your Contribution</span>
              <ArrowRight className="w-4 h-4" />
            </SubmitArticleDialog>
          </div>
        </div>
      </div>
    </section>
  );
}
