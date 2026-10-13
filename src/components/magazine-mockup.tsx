"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sprout } from "lucide-react";
import { motion } from "framer-motion";

interface MagazineMockupProps {
  coverUrl?: string | null;
  title?: string;
  slug?: string | null;
}

export function MagazineMockup({
  coverUrl,
  title = "BBST Student Magazine",
  slug,
}: MagazineMockupProps) {
  const imageSrc = coverUrl || "/images/Magazine.png";
  const href = slug ? `/magazines/${slug}` : "/magazines";

  return (
    <div className="relative w-full flex items-center justify-center select-none py-3 sm:py-5">
      {/* Magazine Composition Center Anchor */}
      <div className="relative flex items-center justify-center">
        {/* Concentrated Emerald Radial Glow directly behind the magazine */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] -z-10 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,255,0,0.22)_0%,rgba(0,229,0,0.11)_38%,rgba(0,200,0,0.03)_65%,transparent_75%)] blur-2xl pointer-events-none" />

        {/* Realistic ground contact shadow */}
        <div className="absolute -bottom-4 sm:-bottom-5 left-1/2 -translate-x-1/2 w-[85%] h-7 sm:h-9 bg-black/25 blur-xl rounded-full pointer-events-none" />

        {/* Cursive Handwritten Annotation — Pinned strictly to the LEFT of the magazine */}
        <motion.div
          className="absolute right-full mr-3 sm:mr-4 xl:mr-6 top-[22%] xl:top-[26%] z-10 hidden lg:flex flex-col items-end pointer-events-none text-right select-none scale-90 xl:scale-100 origin-right"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.9,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
        >
          <span
            className="text-lg xl:text-2xl font-bold text-gray-800 leading-[1.12] tracking-normal -rotate-6 select-none font-caveat whitespace-nowrap"
            style={{
              fontFamily: "var(--font-caveat), 'Caveat', cursive, sans-serif",
            }}
          >
            From Students
            <br />
            for a Better
            <br />
            Tomorrow
          </span>

          {/* Curved arrow pointing towards magazine */}
          <motion.div
            className="mt-2 mr-1 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <span
              className="text-[11px] xl:text-xs font-bold text-gray-700 italic -rotate-6 mr-0.5 select-none font-caveat whitespace-nowrap"
              style={{
                fontFamily: "var(--font-caveat), 'Caveat', cursive, sans-serif",
              }}
            >
              Explore Our
              <br />
              Latest Issue
            </span>
            <svg
              className="w-11 h-8 xl:w-13 xl:h-9 text-gray-700 -rotate-12 mt-0.5 drop-shadow-2xs"
              viewBox="0 0 50 35"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M5,5 Q25,25 40,28" />
              <path d="M32,22 L41,29 L36,34" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Main Magazine Render with entrance animation + continuous float */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.85,
            delay: 0.25,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          className="relative"
        >
          <Link
            href={href}
            className="group relative block focus:outline-none focus:ring-4 focus:ring-[#00E500]/50 rounded-2xl"
            aria-label={`View ${title}`}
          >
            <motion.div
              className="relative w-67.5 xs:w-[300px] sm:w-90 md:w-95 lg:w-100 xl:w-115 2xl:w-120 aspect-1292/1217 drop-shadow-[0_20px_35px_rgba(0,0,0,0.22)] cursor-pointer"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 1.2, 0],
              }}
              whileHover={{
                scale: 1.03,
                rotate: 1.5,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              whileTap={{ scale: 0.98 }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image
                src={imageSrc}
                alt={title}
                fill
                priority
                sizes="(max-width: 640px) 300px, (max-width: 768px) 360px, (max-width: 1024px) 400px, (max-width: 1280px) 460px, 480px"
                className="object-contain object-center"
              />
            </motion.div>
          </Link>
        </motion.div>

        {/* Top Right Tilted Floating Card Badge — Pinned to magazine top-right */}
        <motion.div
          className="absolute -top-3 sm:-top-4 -right-2 sm:-right-4 z-20 flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-white/80 rotate-6 scale-90 sm:scale-100 origin-top-right pointer-events-none sm:pointer-events-auto"
          initial={{ opacity: 0, scale: 0.7, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.08, rotate: 8 }}
          transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
        >
          <motion.div
            animate={{
              y: [0, -5, 0],
              rotate: [6, 4, 6],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <Sprout className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-gray-800 leading-tight">
              Ideas
              <br />
              Today
              <br />
              Impact
              <br />
              Tomorrow
            </div>
          </motion.div>
        </motion.div>

        {/* Right Circular Stat Badge: 12K+ Readers — Pinned to magazine right edge */}
        <motion.div
          className="absolute top-[48%] -right-3 sm:-right-5 lg:-right-6 -translate-y-1/2 z-20 w-15 h-15 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full bg-white/95 backdrop-blur-md shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center cursor-default scale-90 sm:scale-100 origin-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          transition={{
            duration: 0.6,
            delay: 1.0,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
        >
          <motion.div
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="flex flex-col items-center justify-center"
          >
            <span className="font-black text-base sm:text-lg lg:text-xl text-[#171717] leading-none">
              12K+
            </span>
            <span className="text-[9px] sm:text-[10px] lg:text-[11px] font-medium text-gray-500 mt-0.5">
              Readers
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
