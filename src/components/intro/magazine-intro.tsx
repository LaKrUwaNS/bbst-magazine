"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * Fast, cinematic magazine opening intro:
 * - 0.0s – 0.15s: 3D magazine book spread covers the scene with green ambient light
 * - 0.15s – 1.05s: 3D pages open outward around vertical spines, revealing the hero headline on blurred campus photo
 * - 1.05s – 1.45s: Fast, seamless cross-fade directly into the live hero page
 * - 1.45s+: Overlay unmounts completely, full interactivity active
 */
type IntroStage = "book" | "open" | "reveal" | "complete";

const INTRO_STORAGE_KEY = "bbst_intro_seen_v5";

const emptySubscribe = () => () => {};

function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

function useAlreadySeenIntro() {
  return useSyncExternalStore(
    emptySubscribe,
    () => {
      try {
        return sessionStorage.getItem(INTRO_STORAGE_KEY) === "true";
      } catch {
        return false;
      }
    },
    () => true,
  );
}

export function MagazineIntro() {
  const shouldReduceMotion = useReducedMotion();
  const mounted = useHasMounted();
  const alreadySeen = useAlreadySeenIntro();
  const [stage, setStage] = useState<IntroStage>("book");

  const completeIntro = useCallback(() => {
    setStage("complete");
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
    } catch {
      // Storage safe for private browsing
    }
  }, []);

  useEffect(() => {
    if (alreadySeen || shouldReduceMotion) {
      return;
    }

    // Snappy, reduced animation timing (~1.4s total)
    const tOpen = setTimeout(() => {
      setStage("open");
    }, 150);

    const tReveal = setTimeout(() => {
      setStage("reveal");
    }, 1050);

    const tComplete = setTimeout(() => {
      completeIntro();
    }, 1450);

    // Fail-safe timeout
    const tFailSafe = setTimeout(() => {
      completeIntro();
    }, 1900);

    // Keyboard shortcut (Escape) to skip immediately
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        completeIntro();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(tOpen);
      clearTimeout(tReveal);
      clearTimeout(tComplete);
      clearTimeout(tFailSafe);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [alreadySeen, shouldReduceMotion, completeIntro]);

  // Skip if already seen, reduced motion requested, not yet mounted, or animation finished
  if (!mounted || alreadySeen || shouldReduceMotion || stage === "complete") {
    return null;
  }

  const isOpening = stage !== "book";

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key="magazine-intro-overlay"
        initial={{ opacity: 1 }}
        animate={{
          opacity: stage === "reveal" ? 0 : 1,
          pointerEvents: stage === "reveal" ? "none" : "auto",
        }}
        exit={{ opacity: 0, pointerEvents: "none" }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="fixed inset-0 z-50 overflow-hidden bg-white select-none flex flex-col justify-between"
        aria-label="BBST Magazine Opening Experience"
        role="dialog"
        aria-modal="true"
      >
        {/* Floating Skip Intro Button (No Navbar) */}
        <button
          type="button"
          onClick={completeIntro}
          className="absolute top-5 right-5 z-50 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/90 hover:bg-white text-gray-700 hover:text-black border border-gray-200/90 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer group"
          aria-label="Skip introduction animation"
        >
          <span>Skip</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* =================================================================== */}
        {/* EXACT MATCH HERO SECTION BACKGROUND & TWO-COLUMN LAYOUT             */}
        {/* =================================================================== */}
        <div className="relative flex-1 flex flex-col justify-between pt-17 sm:pt-17.5 overflow-hidden">
          {/* Background Image: Aerial Uva Wellassa University Campus — Exact 1:1 match with Hero */}
          <div className="absolute inset-0 -z-20 pointer-events-none select-none overflow-hidden">
            <Image
              src="/uva-imageee.jpg"
              alt="Uva Wellassa University Campus"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center blur-[3px] scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-r from-white/80 via-white/55 to-white/20 pointer-events-none" />
            <div className="absolute inset-0 bg-linear-to-t from-white/50 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Radial emerald aura behind content */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] bg-[radial-gradient(ellipse_at_center,rgba(0,255,0,0.12)_0%,rgba(0,229,0,0.05)_35%,transparent_70%)] pointer-events-none" />

          {/* Main Two-Column Hero Grid — Exact same layout & vertical alignment */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 my-auto py-4 sm:py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
              {/* Left Column: Exact Headline, Eyebrow & Description */}
              <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-left">
                {/* Eyebrow Tagline */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.1 }}
                  className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold tracking-[0.2em] text-[#00C800] uppercase"
                >
                  <span>IDEAS</span>
                  <span className="text-gray-300">|</span>
                  <span>PEOPLE</span>
                  <span className="text-gray-300">|</span>
                  <span>INNOVATION</span>
                  <span className="text-gray-300">|</span>
                  <span>OUR UNIVERSITY</span>
                </motion.div>

                {/* Main Headline — Exact same font, tracking, line breaks & gradient */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-[46px] xl:text-[54px] 2xl:text-[58px] font-black text-[#171717] tracking-tight leading-[1.08] max-w-xl">
                    <span className="block">Student Voices</span>
                    <span className="block mt-1 sm:mt-1.5">
                      <span className="text-[#171717]">for a </span>
                      <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00C800] via-[#00E500] to-[#00B800] drop-shadow-[0_2px_12px_rgba(0,255,0,0.18)]">
                        Brighter Tomorrow
                      </span>
                    </span>
                  </h1>
                </motion.div>

                {/* Editorial Description */}
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.3 }}
                  className="text-base sm:text-lg text-gray-700 max-w-lg leading-relaxed font-normal"
                >
                  BBST Student Magazine is a platform for creativity, research,
                  innovation and stories from our university community.
                </motion.p>
              </div>

              {/* Right Column: Clean area (No poster, opens directly into the live hero's magazine mockup) */}
              <div className="lg:col-span-6 hidden lg:block" />
            </div>
          </div>

          {/* =================================================================== */}
          {/* 3D BOOK-OPENING SPREAD (Turns outward in 3D to reveal hero section) */}
          {/* =================================================================== */}
          <div
            className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden"
            style={{ perspective: 1800 }}
          >
            {/* LEFT 3D OPENING PAGE SPREAD */}
            <motion.div
              initial={{ rotateY: 0, opacity: 1 }}
              animate={
                isOpening
                  ? { rotateY: -110, opacity: 0 }
                  : { rotateY: 0, opacity: 1 }
              }
              transition={{
                duration: 0.85,
                ease: [0.25, 1, 0.5, 1],
              }}
              style={{
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
              }}
              className="absolute left-0 top-0 w-1/2 h-full bg-[#fafbfc] border-r-2 border-gray-200 shadow-2xl flex flex-col justify-between p-8 sm:p-14"
            >
              {/* Paper Spine Shadow on Right Edge */}
              <div className="absolute inset-y-0 right-0 w-12 bg-linear-to-l from-black/15 via-black/5 to-transparent pointer-events-none" />

              {/* Green Sheen Gliding Across Opening Surface */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: isOpening ? "200%" : "-100%" }}
                transition={{ duration: 0.85, ease: "easeInOut" }}
                className="absolute inset-0 w-1/2 bg-linear-to-r from-transparent via-[#00FF00]/15 to-transparent skew-x-12 pointer-events-none"
              />

              <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase text-gray-400 border-b border-gray-200 pb-3">
                <span>BBST Academic Press</span>
                <span>Volume 02</span>
              </div>

              <div className="space-y-3 max-w-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Opening Issue
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
                  Student Voices
                  <br />
                  for a Brighter Tomorrow
                </h2>
                <div className="h-1 w-16 bg-[#00E500] rounded-full" />
              </div>

              <div className="text-[10px] text-gray-400 font-mono border-t border-gray-200 pt-3">
                Uva Wellassa University of Sri Lanka
              </div>
            </motion.div>

            {/* RIGHT 3D OPENING PAGE SPREAD */}
            <motion.div
              initial={{ rotateY: 0, opacity: 1 }}
              animate={
                isOpening
                  ? { rotateY: 110, opacity: 0 }
                  : { rotateY: 0, opacity: 1 }
              }
              transition={{
                duration: 0.85,
                ease: [0.25, 1, 0.5, 1],
              }}
              style={{
                transformOrigin: "right center",
                transformStyle: "preserve-3d",
              }}
              className="absolute right-0 top-0 w-1/2 h-full bg-[#fbfcfd] border-l-2 border-gray-200 shadow-2xl flex flex-col justify-between p-8 sm:p-14 text-right"
            >
              {/* Paper Spine Shadow on Left Edge */}
              <div className="absolute inset-y-0 left-0 w-12 bg-linear-to-r from-black/15 via-black/5 to-transparent pointer-events-none" />

              {/* Green Sheen */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: isOpening ? "-200%" : "100%" }}
                transition={{ duration: 0.85, ease: "easeInOut" }}
                className="absolute inset-0 w-1/2 bg-linear-to-l from-transparent via-[#00FF00]/15 to-transparent -skew-x-12 pointer-events-none"
              />

              <div className="flex items-center justify-between flex-row-reverse text-[10px] font-bold tracking-widest uppercase text-gray-400 border-b border-gray-200 pb-3">
                <span>Technovation Series</span>
                <span>Issue 2025</span>
              </div>

              <div className="space-y-3 max-w-sm ml-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Editorial Curation
                </span>
                <p className="text-sm text-gray-600 font-serif leading-relaxed">
                  Innovation, agricultural sustainability, science and student
                  creative essays.
                </p>
                <div className="h-1 w-16 bg-[#00E500] rounded-full ml-auto" />
              </div>

              <div className="text-[10px] text-gray-400 font-mono border-t border-gray-200 pt-3">
                Faculty of Technological Studies
              </div>
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
