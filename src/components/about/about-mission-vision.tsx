"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Target, Eye, CheckCircle2, Sparkles, Compass } from "lucide-react";

export function AboutMissionVision() {
  const shouldReduceMotion = useReducedMotion();

  const missionPillars = [
    "Provide an inclusive platform for student writers, researchers, and creators across all departments.",
    "Promote critical inquiry and translate academic investigations into engaging, accessible prose.",
    "Cultivate professional journalism, digital editorial skills, and leadership amongst undergraduates.",
  ];

  const visionPillars = [
    "Become the benchmark student-led university publication across Sri Lankan higher education.",
    "Inspire curiosity, sustainable innovation, and ethical technological progress in future leaders.",
    "Build a permanent living archive of student intellectual and cultural achievements.",
  ];

  return (
    <section className="py-20 bg-linear-to-b from-gray-50/60 to-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            Guiding Principles
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
            Our Purpose &amp; Direction
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Rooted in academic passion and student drive, our mission and vision shape
            every article we publish and every edition we curate.
          </p>
        </div>

        {/* Two-Column Grid: Mission and Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {/* Mission Card */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="group relative p-8 sm:p-10 rounded-3xl bg-white border border-gray-200/90 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            {/* Top accent badge & icon */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs group-hover:scale-105 transition-transform">
                  <Target className="w-7 h-7 text-[#00C800]" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50/80 px-3 py-1 rounded-full border border-emerald-200/60">
                  Core Purpose
                </span>
              </div>

              {/* Title & Statement */}
              <h3 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight mb-4">
                Our Mission
              </h3>
              <p className="text-base text-gray-700 leading-relaxed mb-6 font-medium">
                To provide an open, dynamic, and inspiring publication platform where
                students of Uva Wellassa University express original ideas, share knowledge,
                showcase creative talents, and contribute meaningful perspectives to our
                academic and broader community.
              </p>

              {/* Pillars */}
              <ul className="space-y-3 pt-2 border-t border-gray-100 text-sm text-gray-600">
                {missionPillars.map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00C800] shrink-0 mt-0.5" />
                    <span className="leading-normal">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Glow Strip */}
            <div className="mt-8 pt-4 flex items-center gap-2 text-xs font-bold text-emerald-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dedicated to student expression and academic dialogue</span>
            </div>
          </motion.div>

          {/* Vision Card */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
            className="group relative p-8 sm:p-10 rounded-3xl bg-linear-to-br from-white via-white to-emerald-50/40 border border-gray-200/90 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#171717] flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform">
                  <Eye className="w-7 h-7 text-[#00E500]" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-gray-800 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                  Future Horizon
                </span>
              </div>

              {/* Title & Statement */}
              <h3 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight mb-4">
                Our Vision
              </h3>
              <p className="text-base text-gray-700 leading-relaxed mb-6 font-medium">
                To build a vibrant, nationally recognized student publication that nurtures
                intellectual curiosity, champions scientific and cultural innovation, promotes
                interdisciplinary collaboration, and empowers graduates to make meaningful
                contributions to society.
              </p>

              {/* Pillars */}
              <ul className="space-y-3 pt-2 border-t border-gray-100 text-sm text-gray-600">
                {visionPillars.map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-normal">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Glow Strip */}
            <div className="mt-8 pt-4 flex items-center gap-2 text-xs font-bold text-gray-700">
              <span className="w-2 h-2 rounded-full bg-[#00E500]" />
              <span>Championing curiosity, critical thought, and ethical innovation</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
