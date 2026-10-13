"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  Compass,
  FlaskConical,
  Sprout,
  Laptop,
  Palette,
  Users,
  ChevronDown,
} from "lucide-react";

/**
 * Editorial Pillars featured in the collage.
 * Each corresponds to authentic university faculties and student publication pillars.
 */
interface EditorialPillar {
  id: string;
  title: string;
  category: string;
  slug: string;
  image: string;
  caption: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  accentBg: string;
}

const EDITORIAL_PILLARS: EditorialPillar[] = [
  {
    id: "science",
    title: "Biotechnology & Lab Discoveries",
    category: "Science & Research",
    slug: "science-research",
    image: "/images/editorial/science.jpg",
    caption:
      "Student researchers developing next-gen biofuels & cellular agriculture.",
    icon: FlaskConical,
    accentColor: "#00E500",
    accentBg: "rgba(0, 229, 0, 0.12)",
  },
  {
    id: "agriculture",
    title: "Vertical Harvests & Eco Systems",
    category: "Agriculture & Environment",
    slug: "agriculture-environment",
    image: "/images/editorial/agriculture.jpg",
    caption:
      "Pioneering hydroponic urban agriculture for campus sustainability.",
    icon: Sprout,
    accentColor: "#10B981",
    accentBg: "rgba(16, 185, 129, 0.12)",
  },
  {
    id: "technology",
    title: "Robotics & Embedded Systems",
    category: "Technology & Innovation",
    slug: "technology-innovation",
    image: "/images/editorial/technology.jpg",
    caption:
      "Collaborative prototyping in the student hardware & AI laboratory.",
    icon: Laptop,
    accentColor: "#059669",
    accentBg: "rgba(5, 150, 105, 0.12)",
  },
  {
    id: "arts",
    title: "Visual Narrative & Design Studio",
    category: "Arts & Literature",
    slug: "arts-literature",
    image: "/images/editorial/arts.jpg",
    caption:
      "Student design boards, typography craft & quarterly layout curation.",
    icon: Palette,
    accentColor: "#047857",
    accentBg: "rgba(4, 120, 87, 0.12)",
  },
  {
    id: "campus",
    title: "Collegiate Voices & Community",
    category: "Society & Culture",
    slug: "society-culture",
    image: "/images/editorial/campus.jpg",
    caption:
      "Student leadership, academic symposiums & cross-campus discourse.",
    icon: Users,
    accentColor: "#00E500",
    accentBg: "rgba(0, 229, 0, 0.12)",
  },
];

export function EditorialScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  // Responsive breakpoint detection for motion offset calculations
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Track scroll progress along the pinned container (0.0 to 1.0)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Spring physics for buttery-smooth interpolation in both scroll directions
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 25,
    restDelta: 0.0008,
  });

  // ---------------------------------------------------------------------------
  // PHASE 1 — Header & Eyebrow Animations
  // ---------------------------------------------------------------------------
  const headerOpacity = useTransform(
    smoothProgress,
    [0.0, 0.08, 0.2, 0.3],
    [0, 1, 1, 0],
  );
  const headerY = useTransform(
    smoothProgress,
    [0.0, 0.08, 0.2, 0.3],
    [30, 0, 0, -20],
  );

  // ---------------------------------------------------------------------------
  // PHASE 1 & 2 — Central 3D Magazine Transforms
  // ---------------------------------------------------------------------------
  const magScale = useTransform(
    smoothProgress,
    [0.0, 0.18, 0.38, 0.65, 0.82, 0.98],
    isMobile
      ? [0.75, 0.9, 0.92, 0.82, 0.72, 0.62]
      : [0.8, 1.0, 1.04, 0.96, 0.84, 0.72],
  );
  const magY = useTransform(
    smoothProgress,
    [0.0, 0.18, 0.38, 0.75, 0.98],
    [120, 0, 0, -20, -70],
  );
  const magOpacity = useTransform(
    smoothProgress,
    [0.0, 0.08, 0.82, 0.96],
    [0, 1, 1, 0],
  );
  const magRotateX = useTransform(smoothProgress, [0.0, 0.18], [10, 0]);
  const magRotateZ = useTransform(smoothProgress, [0.0, 0.18], [-3, 0]);

  // Front cover spine rotation: firmly closed during emergence (0-0.22), then opens smoothly to -142deg
  const coverRotateY = useTransform(
    smoothProgress,
    [0.22, 0.46, 0.85],
    [0, -142, -142],
  );

  // Center alignment shift as cover turns leftwards
  const spreadShiftX = useTransform(
    smoothProgress,
    [0.22, 0.46],
    isMobile ? [0, 20] : [0, 48],
  );

  // Dynamic shadow cast onto the right page that clears as the cover opens
  const innerShadowOpacity = useTransform(
    smoothProgress,
    [0.22, 0.42],
    [0.35, 0],
  );

  // ---------------------------------------------------------------------------
  // PHASE 3 — Floating Editorial Collage Cards (Anchored to Screen Center)
  // ---------------------------------------------------------------------------
  // Card 1: Science & Research (Top Left)
  const scienceX = useTransform(
    smoothProgress,
    [0.4, 0.66],
    isMobile ? [-20, -125] : [-50, -480],
  );
  const scienceY = useTransform(
    smoothProgress,
    [0.4, 0.66],
    isMobile ? [20, -135] : [30, -165],
  );
  const scienceScale = useTransform(
    smoothProgress,
    [0.4, 0.62, 0.78, 0.92],
    isMobile ? [0.6, 0.88, 0.88, 0.65] : [0.6, 1.04, 1.0, 0.7],
  );
  const scienceOpacity = useTransform(
    smoothProgress,
    [0.4, 0.5, 0.78, 0.9],
    [0, 1, 1, 0],
  );
  const scienceRotate = useTransform(smoothProgress, [0.4, 0.66], [0, -4]);

  // Card 2: Agriculture & Environment (Bottom Left)
  const agriX = useTransform(
    smoothProgress,
    [0.42, 0.68],
    isMobile ? [-10, -115] : [-40, -450],
  );
  const agriY = useTransform(
    smoothProgress,
    [0.42, 0.68],
    isMobile ? [10, 145] : [20, 175],
  );
  const agriScale = useTransform(
    smoothProgress,
    [0.42, 0.64, 0.78, 0.92],
    isMobile ? [0.6, 0.85, 0.85, 0.65] : [0.6, 1.0, 0.96, 0.7],
  );
  const agriOpacity = useTransform(
    smoothProgress,
    [0.42, 0.52, 0.78, 0.9],
    [0, 1, 1, 0],
  );
  const agriRotate = useTransform(smoothProgress, [0.42, 0.68], [0, 3]);

  // Card 3: Technology & Innovation (Top Right)
  const techX = useTransform(
    smoothProgress,
    [0.44, 0.7],
    isMobile ? [20, 125] : [50, 480],
  );
  const techY = useTransform(
    smoothProgress,
    [0.44, 0.7],
    isMobile ? [20, -135] : [30, -165],
  );
  const techScale = useTransform(
    smoothProgress,
    [0.44, 0.66, 0.78, 0.92],
    isMobile ? [0.6, 0.88, 0.88, 0.65] : [0.6, 1.04, 1.0, 0.7],
  );
  const techOpacity = useTransform(
    smoothProgress,
    [0.44, 0.54, 0.78, 0.9],
    [0, 1, 1, 0],
  );
  const techRotate = useTransform(smoothProgress, [0.44, 0.7], [0, 4]);

  // Card 4: Arts & Literature (Bottom Right)
  const artsX = useTransform(
    smoothProgress,
    [0.46, 0.72],
    isMobile ? [10, 115] : [40, 450],
  );
  const artsY = useTransform(
    smoothProgress,
    [0.46, 0.72],
    isMobile ? [10, 145] : [20, 175],
  );
  const artsScale = useTransform(
    smoothProgress,
    [0.46, 0.68, 0.78, 0.92],
    isMobile ? [0.6, 0.85, 0.85, 0.65] : [0.6, 1.0, 0.96, 0.7],
  );
  const artsOpacity = useTransform(
    smoothProgress,
    [0.46, 0.56, 0.78, 0.9],
    [0, 1, 1, 0],
  );
  const artsRotate = useTransform(smoothProgress, [0.46, 0.72], [0, -3]);

  // Card 5: Campus Life (Top Center)
  const campusY = useTransform(
    smoothProgress,
    [0.48, 0.74],
    isMobile ? [30, -220] : [40, -270],
  );
  const campusScale = useTransform(
    smoothProgress,
    [0.48, 0.7, 0.78, 0.92],
    isMobile ? [0.6, 0.85, 0.85, 0.65] : [0.6, 1.02, 0.98, 0.7],
  );
  const campusOpacity = useTransform(
    smoothProgress,
    [0.48, 0.58, 0.78, 0.9],
    [0, 1, 1, 0],
  );
  const campusRotate = useTransform(smoothProgress, [0.48, 0.74], [0, 1]);

  // ---------------------------------------------------------------------------
  // PHASE 4 — Smooth Transition into Editorial Feed
  // ---------------------------------------------------------------------------
  const transitionBannerOpacity = useTransform(
    smoothProgress,
    [0.78, 0.88, 0.98],
    [0, 1, 1],
  );
  const transitionBannerY = useTransform(smoothProgress, [0.78, 0.88], [30, 0]);

  // Parallax background leaves
  const leaf1Y = useTransform(smoothProgress, [0.0, 1.0], [0, -220]);
  const leaf1Rotate = useTransform(smoothProgress, [0.0, 1.0], [-25, 20]);
  const leaf2Y = useTransform(smoothProgress, [0.0, 1.0], [0, -280]);
  const leaf2Rotate = useTransform(smoothProgress, [0.0, 1.0], [35, -15]);

  // ---------------------------------------------------------------------------
  // REDUCED MOTION PRESENTATION (Accessibility Fallback)
  // ---------------------------------------------------------------------------
  if (shouldReduceMotion) {
    return (
      <section className="relative py-20 bg-linear-to-b from-white via-gray-50/60 to-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-[#00E500]" />
              Editorial Pillars
            </span>
            <h2 className="text-3xl font-black text-[#171717] mt-3 tracking-tight">
              Explore the BBST Magazine Universe
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Discover student research, agricultural innovation, technology
              prototypes, and creative writing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EDITORIAL_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Link
                  key={pillar.id}
                  href={`/categories/${pillar.slug}`}
                  className="group block rounded-2xl border border-gray-200/90 bg-white overflow-hidden hover:border-[#00E500] hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={pillar.image}
                      alt={pillar.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-[#171717] shadow-xs flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-[#00E500]" />
                      <span>{pillar.category}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[#171717] group-hover:text-emerald-800 transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                      {pillar.caption}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // ---------------------------------------------------------------------------
  // FULL CINEMATIC SCROLL-DRIVEN EXPERIENCE
  // ---------------------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      className="relative w-full h-[360vh] bg-linear-to-b from-white via-[#fcfdfd] to-white"
    >
      {/* Pinned Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center pointer-events-none pt-14 sm:pt-16">
        {/* =================================================================== */}
        {/* ATMOSPHERIC BACKGROUND: Radial Green Aura & Parallax Leaves         */}
        {/* =================================================================== */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle central glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-160 sm:w-220 h-140 bg-radial from-[#00E500]/12 via-emerald-100/10 to-transparent blur-3xl opacity-80" />

          {/* Parallax Floating Leaf Left */}
          <motion.div
            style={{ y: leaf1Y, rotate: leaf1Rotate }}
            className="absolute top-[22%] left-[4%] w-12 sm:w-16 aspect-square opacity-70"
          >
            <Image
              src="/images/Leaf1.png"
              alt=""
              width={64}
              height={64}
              className="object-contain drop-shadow-md"
            />
          </motion.div>

          {/* Parallax Floating Leaf Right */}
          <motion.div
            style={{ y: leaf2Y, rotate: leaf2Rotate }}
            className="absolute top-[28%] right-[5%] w-14 sm:w-20 aspect-square opacity-70"
          >
            <Image
              src="/images/Leaf2.png"
              alt=""
              width={80}
              height={80}
              className="object-contain drop-shadow-md"
            />
          </motion.div>
        </div>

        {/* Central Stage Container */}
        <div className="relative w-full max-w-7xl h-full flex items-center justify-center">
          {/* =================================================================== */}
          {/* PHASE 1: SCROLL INTRO EYEBROW & TITLE                               */}
          {/* =================================================================== */}
          <motion.div
            style={{ opacity: headerOpacity, y: headerY }}
            className="absolute top-4 sm:top-6 inset-x-0 mx-auto text-center px-4 max-w-2xl z-30 pointer-events-none"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-emerald-800 bg-white/90 border border-emerald-200/80 shadow-2xs backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#00E500] animate-pulse" />
              <span>Cinematic Editorial Journey</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#171717] tracking-tight mt-2.5">
              Turn the Cover. <br className="sm:hidden" />
              <span className="bg-linear-to-r from-emerald-800 via-[#171717] to-emerald-700 bg-clip-text text-transparent">
                Discover the Voices.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 font-medium flex items-center justify-center gap-1.5">
              <span>Scroll down to open the latest edition</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
            </p>
          </motion.div>

          {/* =================================================================== */}
          {/* PHASE 2: 3D MAGAZINE OBJECT WITH PHYSICAL ROTATING FLAP              */}
          {/* =================================================================== */}
          <motion.div
            style={{
              scale: magScale,
              y: magY,
              opacity: magOpacity,
              rotateX: magRotateX,
              rotateZ: magRotateZ,
              perspective: 1800,
            }}
            className="relative flex items-center justify-center transform-gpu z-20 pointer-events-auto"
          >
            {/* Ground Contact Shadow */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-80 sm:w-120 h-10 bg-black/20 blur-2xl rounded-full pointer-events-none" />

            {/* 3D Spread Container */}
            <motion.div
              style={{
                x: spreadShiftX,
                transformStyle: "preserve-3d",
              }}
              className="relative w-68 h-92 sm:w-85 sm:h-115"
            >
              {/* Paper Edges (Stacked depth beneath right page) */}
              <div
                className="absolute inset-0 bg-[#eef0f2] rounded-r-lg shadow-md border-r-4 border-b-4 border-gray-300 pointer-events-none"
                style={{ transform: "translateZ(-8px)" }}
              />
              <div
                className="absolute inset-0 bg-[#f7f8f9] rounded-r-lg shadow-xs border-r-2 border-b-2 border-gray-200 pointer-events-none"
                style={{ transform: "translateZ(-4px)" }}
              />

              {/* INNER RIGHT PAGE (Clean white sheet) */}
              <div
                className="absolute inset-0 bg-white rounded-r-lg shadow-xl overflow-hidden border border-gray-100"
                style={{ transform: "translateZ(0px)" }}
              >
                {/* Spine Crease Shadow */}
                <div className="absolute inset-y-0 left-0 w-8 bg-linear-to-r from-black/25 via-black/5 to-transparent pointer-events-none z-10" />

                {/* Clean white paper sheet */}
                <div className="w-full h-full bg-[#fdfdfd]" />

                {/* Dynamic Cover Shadow (fades as cover opens) */}
                <motion.div
                  style={{ opacity: innerShadowOpacity }}
                  className="absolute inset-0 bg-black pointer-events-none z-20"
                />
              </div>

              {/* INNER LEFT PAGE (Visible when cover is rotated open) */}
              <div
                className="absolute inset-0 bg-white rounded-l-lg shadow-xl overflow-hidden border border-gray-100 flex flex-col justify-between p-5 sm:p-7"
                style={{
                  transform: "translateX(-100%) translateZ(0px)",
                }}
              >
                {/* Spine Shadow on right edge */}
                <div className="absolute inset-y-0 right-0 w-8 bg-linear-to-l from-black/20 via-black/5 to-transparent pointer-events-none z-10" />

                {/* Editorial Welcome & Table of Contents */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-gray-500">
                    <span>Vol. 02 • 2025</span>
                    <span>Editorial Board</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Curator’s Note
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-[#171717] tracking-tight leading-snug">
                      Student Voices,
                      <br />
                      Limitless Frontiers
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-gray-600 leading-relaxed font-serif">
                      Within this quarterly edition, our researchers and writers
                      bridge agricultural sustainability, robotic innovation,
                      and artistic expression.
                    </p>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-gray-100 text-[9px] font-semibold text-gray-700">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00E500]" />
                        Science &amp; Research
                      </span>
                      <span className="text-gray-400 font-mono">p. 06</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Agri-Tech &amp; Ecology
                      </span>
                      <span className="text-gray-400 font-mono">p. 14</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                        Robotics &amp; AI
                      </span>
                      <span className="text-gray-400 font-mono">p. 22</span>
                    </div>
                  </div>
                </div>

                <div className="text-[8px] sm:text-[9px] text-gray-400 border-t border-gray-100 pt-2 font-mono flex items-center justify-between">
                  <span>ISSN 2984-1029</span>
                  <span>BBST Press</span>
                </div>
              </div>

              {/* FRONT COVER FLAP (Rotates around left spine) */}
              <motion.div
                style={{
                  rotateY: coverRotateY,
                  transformStyle: "preserve-3d",
                }}
                className="absolute inset-0 rounded-r-lg overflow-visible origin-left"
              >
                {/* Outer Front Cover (Closed facing) */}
                <div
                  className="absolute inset-0 rounded-r-lg overflow-hidden shadow-2xl border border-gray-200 bg-white"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(0deg)",
                  }}
                >
                  <Image
                    src="/images/Magazine.png"
                    alt="BBST Student Magazine Front Cover"
                    fill
                    sizes="(max-width: 640px) 270px, 350px"
                    className="object-cover object-left"
                  />
                </div>

                {/* Inner Reverse Cover (Visible when flipped open 180deg) */}
                <div
                  className="absolute inset-0 rounded-l-lg overflow-hidden shadow-lg border border-gray-200 bg-[#f8fafc] flex flex-col justify-between p-6"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="text-center space-y-2 my-auto">
                    <div className="w-10 h-10 rounded-full bg-[#00E500]/15 border border-[#00E500]/30 flex items-center justify-center mx-auto text-emerald-800">
                      <BookOpen className="w-5 h-5 stroke-2" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 block">
                      Inside Issue 02
                    </span>
                    <p className="text-[9px] text-gray-500 font-serif max-w-40 mx-auto leading-relaxed">
                      Dedicated to university thinkers, innovators, and
                      creators.
                    </p>
                  </div>
                  <div className="text-center text-[8px] text-gray-400 font-mono border-t border-gray-200 pt-2">
                    Published Annually
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* =================================================================== */}
          {/* PHASE 3: LAYERED EDITORIAL COLLAGE CARDS (Anchored from center)     */}
          {/* =================================================================== */}
          {/* CARD 1: Science & Research (Top Left) */}
          <motion.div
            style={{
              x: scienceX,
              y: scienceY,
              scale: scienceScale,
              opacity: scienceOpacity,
              rotate: scienceRotate,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto"
          >
            <CollageCard pillar={EDITORIAL_PILLARS[0]} isCompact={isMobile} />
          </motion.div>

          {/* CARD 2: Agriculture & Environment (Bottom Left) */}
          <motion.div
            style={{
              x: agriX,
              y: agriY,
              scale: agriScale,
              opacity: agriOpacity,
              rotate: agriRotate,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto"
          >
            <CollageCard pillar={EDITORIAL_PILLARS[1]} isCompact={isMobile} />
          </motion.div>

          {/* CARD 3: Technology & Innovation (Top Right) */}
          <motion.div
            style={{
              x: techX,
              y: techY,
              scale: techScale,
              opacity: techOpacity,
              rotate: techRotate,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto"
          >
            <CollageCard pillar={EDITORIAL_PILLARS[2]} isCompact={isMobile} />
          </motion.div>

          {/* CARD 4: Arts & Literature (Bottom Right) */}
          <motion.div
            style={{
              x: artsX,
              y: artsY,
              scale: artsScale,
              opacity: artsOpacity,
              rotate: artsRotate,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto"
          >
            <CollageCard pillar={EDITORIAL_PILLARS[3]} isCompact={isMobile} />
          </motion.div>

          {/* CARD 5: Campus Life (Top Center) */}
          {!isMobile && (
            <motion.div
              style={{
                y: campusY,
                scale: campusScale,
                opacity: campusOpacity,
                rotate: campusRotate,
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-25 pointer-events-auto"
            >
              <CollageCard pillar={EDITORIAL_PILLARS[4]} isWide />
            </motion.div>
          )}

          {/* =================================================================== */}
          {/* PHASE 4: TRANSITION OVERLAY INTO EDITORIAL FEED                     */}
          {/* =================================================================== */}
          <motion.div
            style={{
              opacity: transitionBannerOpacity,
              y: transitionBannerY,
            }}
            className="absolute inset-x-0 bottom-6 sm:bottom-10 mx-auto text-center px-4 max-w-xl z-40 pointer-events-auto"
          >
            <div className="bg-white/95 backdrop-blur-md p-5 sm:p-7 rounded-3xl border border-gray-200/90 shadow-2xl space-y-3.5">
              <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Compass className="w-4 h-4 text-[#00E500]" />
                <span>Explore the Whole Story</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
                Dive into Student Articles &amp; Research
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                From breakthrough science to insightful arts reviews, read the
                full articles authored by our collegiate contributors below.
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
                >
                  <span>Browse All Articles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all cursor-pointer"
                >
                  <span>View Categories</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/**
 * High-Aesthetic Editorial Card for the Floating 3D Collage
 */
function CollageCard({
  pillar,
  isWide = false,
  isCompact = false,
}: {
  pillar: EditorialPillar;
  isWide?: boolean;
  isCompact?: boolean;
}) {
  const Icon = pillar.icon;

  if (isCompact) {
    return (
      <Link
        href={`/categories/${pillar.slug}`}
        className="group block w-40 sm:w-44 rounded-xl bg-white border border-gray-200/90 shadow-xl overflow-hidden hover:border-[#00E500] transition-all"
      >
        <div className="relative aspect-4/3 w-full bg-gray-100">
          <Image
            src={pillar.image}
            alt={pillar.title}
            fill
            sizes="180px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/95 text-[#171717] shadow-xs flex items-center gap-1">
            <Icon className="w-2.5 h-2.5 text-[#00E500]" />
            <span className="truncate max-w-24">{pillar.category}</span>
          </div>
        </div>
        <div className="p-2.5">
          <h4 className="text-[11px] font-bold text-[#171717] line-clamp-1 group-hover:text-emerald-800 transition-colors">
            {pillar.title}
          </h4>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/categories/${pillar.slug}`}
      className={`group block ${
        isWide ? "w-68 sm:w-76" : "w-56 sm:w-64"
      } rounded-2xl bg-white border border-gray-200/90 shadow-2xl overflow-hidden hover:border-[#00E500] hover:shadow-[0_20px_35px_-10px_rgba(0,229,0,0.18)] transition-all duration-300`}
    >
      <div
        className={`relative ${
          isWide ? "aspect-video" : "aspect-4/3"
        } w-full overflow-hidden bg-gray-100`}
      >
        <Image
          src={pillar.image}
          alt={pillar.title}
          fill
          sizes={isWide ? "310px" : "260px"}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-[#171717] shadow-sm flex items-center gap-1.5 backdrop-blur-xs">
          <Icon className="w-3.5 h-3.5 text-[#00E500]" />
          <span>{pillar.category}</span>
        </div>
      </div>
      <div className="p-3.5 sm:p-4">
        <h4 className="text-xs sm:text-sm font-bold text-[#171717] group-hover:text-emerald-800 transition-colors leading-snug line-clamp-1">
          {pillar.title}
        </h4>
        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
          {pillar.caption}
        </p>
        <div className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-emerald-700 group-hover:text-[#00E500] transition-colors">
          <span>Read category articles</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
