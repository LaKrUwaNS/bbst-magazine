"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  Calendar,
  Users,
  Lightbulb,
  Share2,
  type LucideIcon,
} from "lucide-react";

interface HeroCategory {
  id: string;
  label: string;
  sublabel: string;
  icon: LucideIcon;
  slug: string;
}

const HERO_CATEGORIES: HeroCategory[] = [
  {
    id: "workshops",
    label: "Seminars",
    sublabel: "& Workshops",
    icon: Calendar,
    slug: "workshops",
  },
  {
    id: "student-activities",
    label: "Student",
    sublabel: "Activities",
    icon: Users,
    slug: "student-activities",
  },
  {
    id: "competitions",
    label: "Competitions",
    sublabel: "& Innovation",
    icon: Lightbulb,
    slug: "competitions",
  },
  {
    id: "community",
    label: "Community",
    sublabel: "& Networking",
    icon: Share2,
    slug: "community",
  },
];

interface EventsHeroProps {
  selectedCategory?: string;
  onSelectCategory: (categorySlug: string | undefined) => void;
}

export function EventsHero({
  selectedCategory,
  onSelectCategory,
}: EventsHeroProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative w-full rounded-2xl sm:rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-xs mb-8 lg:mb-10">
      {/* Subtle Ambient Green Glow Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -left-12 w-64 h-64 rounded-full bg-[#00FF00]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 left-1/3 w-72 h-72 rounded-full bg-emerald-400/8 blur-3xl"
      />

      {/* Ambient Floating Leaves matching screenshot and BBST branding */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-4 left-3 w-8 h-8 sm:w-10 sm:h-10 z-20 animate-leaf-1 hidden sm:block opacity-75"
      >
        <Image
          src="/images/Leaf1.png"
          alt=""
          fill
          sizes="40px"
          className="object-contain"
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 left-6 w-9 h-9 sm:w-11 sm:h-11 z-20 animate-leaf-2 hidden sm:block opacity-70"
      >
        <Image
          src="/images/Leaf2.png"
          alt=""
          fill
          sizes="44px"
          className="object-contain"
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-6 right-6 w-8 h-8 sm:w-10 sm:h-10 z-20 animate-leaf-3 hidden lg:block opacity-70"
      >
        <Image
          src="/images/Leaf1.png"
          alt=""
          fill
          sizes="40px"
          className="object-contain"
        />
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center min-h-[240px] sm:min-h-[280px] lg:min-h-[300px]">
        {/* Left Column: Editorial Headline & Categories */}
        <div className="lg:col-span-7 z-10 px-6 sm:px-10 lg:px-12 py-8 sm:py-10 flex flex-col justify-center">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="space-y-4"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00C800]">
                JOIN | PARTICIPATE | BE INSPIRED
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#171717] tracking-tight leading-none">
              BBST <span className="text-[#00C800]">Events</span>
            </h1>

            {/* Narrative Subtitle */}
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-xl">
              Discover upcoming events, workshops, seminars and student activities from our university community.
            </p>

            {/* Event Category Highlight Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {HERO_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.slug;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      onSelectCategory(isActive ? undefined : cat.slug)
                    }
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#00E500]/15 border-[#00C800] text-[#171717] shadow-xs"
                        : "bg-gray-50/80 hover:bg-gray-100/80 border-gray-100 text-gray-700 hover:border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "bg-[#00C800] text-white"
                          : "bg-white text-[#00C800] border border-gray-100 shadow-2xs"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="text-[11px] font-bold truncate">
                        {cat.label}
                      </span>
                      <span className="text-[9.5px] text-gray-500 font-medium truncate">
                        {cat.sublabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile Campus Banner Preview */}
            <div className="block sm:hidden relative w-full h-40 rounded-xl overflow-hidden mt-3 shadow-2xs border border-gray-100">
              <Image
                src="/images/events/uva-campus-panorama.jpg"
                alt="Uva Wellassa University Campus"
                fill
                quality={95}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          </motion.div>
        </div>

        {/* Right Column: Panoramic Uva Wellassa Campus Events Imagery */}
        <div className="hidden sm:block lg:col-span-5 relative h-full min-h-[270px] lg:min-h-[320px] w-full overflow-hidden">
          <Image
            src="/images/events/uva-campus-panorama.jpg"
            alt="Uva Wellassa University Campus"
            fill
            priority
            quality={95}
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-cover object-[65%_center] lg:object-center"
          />

          {/* Clean edge blend on the left so the photo transitions smoothly into white */}
          <div className="absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
