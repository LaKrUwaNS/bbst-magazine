"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Send, ArrowRight, BookOpen } from "lucide-react";
import { SubmitArticleDialog } from "@/components/submit-article-dialog";

export function CategoryCtaSection() {
  return (
    <section className="mt-16 pt-12 border-t border-gray-100">
      <div className="relative rounded-3xl bg-linear-to-r from-[#171717] via-[#1E1E1E] to-[#171717] text-white p-8 sm:p-12 overflow-hidden shadow-xl">
        {/* Subtle Ambient Emerald Flares */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#00FF00]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#00FF00]/20 blur-3xl"
        />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-[#00FF00] border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#00FF00]" />
            <span>Undergraduate &amp; Faculty Contributions</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Have Research or Stories to Share in Any Category?
          </h3>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Whether your project sits at the intersection of agriculture and loT,
            or you have an essay exploring campus culture, our editorial board
            welcomes your voice. Submit your article draft today.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <SubmitArticleDialog triggerClassName="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black transition-all hover:scale-[1.02] shadow-md cursor-pointer">
              <Send className="w-4 h-4" />
              <span>Submit an Article</span>
              <ArrowRight className="w-4 h-4" />
            </SubmitArticleDialog>

            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Browse All Articles</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
