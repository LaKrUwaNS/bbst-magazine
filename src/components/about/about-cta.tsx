"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, FileText, Send, Sparkles } from "lucide-react";
import { SubmitArticleDialog } from "@/components/submit-article-dialog";

export function AboutCTA() {
  const shouldReduceMotion = useReducedMotion();
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  return (
    <>
      <section className="relative py-20 lg:py-28 bg-[#171717] text-white overflow-hidden">
        {/* Ambient Radial Glowing Elements */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#00FF00]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl"
        />

        {/* Ambient subtle leaf */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-12 right-12 w-14 aspect-square opacity-30 select-none hidden lg:block rotate-45"
        >
          <Image
            src="/images/Leaf1.png"
            alt=""
            fill
            sizes="56px"
            className="object-contain"
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#00E500] bg-white/10 border border-white/15 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              Join the BBST Movement
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              Your Ideas Deserve to Be Read.
            </h2>

            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Explore inspiring stories, discover new perspectives, and share your
              creativity with the BBST Magazine community.
            </p>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            {/* Submit Article Primary Trigger */}
            <button
              type="button"
              onClick={() => setSubmitDialogOpen(true)}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-lg shadow-[#00E500]/20 transition-all hover:scale-[1.03] active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit an Article</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            {/* Explore Magazines */}
            <Link
              href="/magazines"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4 text-[#00E500]" />
              <span>Explore Magazines</span>
            </Link>

            {/* Read Articles */}
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-gray-300 hover:text-white transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Read Articles</span>
            </Link>
          </motion.div>

          {/* Bottom Trust Indicators */}
          <div className="pt-8 flex flex-wrap justify-center items-center gap-8 text-xs text-gray-400 border-t border-white/10">
            <span>Uva Wellassa University of Sri Lanka</span>
            <span>•</span>
            <span>Peer-Reviewed Editorial Standards</span>
            <span>•</span>
            <span>Open Access to All Readers</span>
          </div>
        </div>
      </section>

      {/* Controlled Submission Dialog */}
      <SubmitArticleDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
      />
    </>
  );
}
