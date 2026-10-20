"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Sparkles, Award, Lightbulb, Compass } from "lucide-react";

export function AboutStory() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="our-story" className="py-20 lg:py-28 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Story & Editorial Narrative */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Section Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E500]" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Our Story &amp; Purpose
              </span>
            </div>

            {/* Suggested Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#171717] tracking-tight leading-tight">
              More Than a Magazine. <br />
              <span className="text-[#00C800]">A Community of Ideas.</span>
            </h2>

            {/* Editorial Lead Paragraph */}
            <p className="text-lg text-gray-800 font-medium leading-relaxed">
              BBST Magazine was established at Uva Wellassa University to bridge
              the gap between classroom curiosity, laboratory discoveries, and
              creative student expression.
            </p>

            {/* Narrative Body */}
            <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
              <p>
                Nestled amidst the hills of Badulla, Uva Wellassa University is
                renowned for fostering value addition, entrepreneurial drive,
                and applied scientific research. Within this dynamic
                environment, the students of the Biosystems Technology and
                Applied Sciences faculties recognized that our university&apos;s
                most inspiring ideas often remained confined within lab
                journals, examination papers, and lecture hall discussions.
              </p>
              <p>
                BBST Magazine was born out of a collective desire to give those
                ideas a voice. What started as an editorial initiative to
                highlight sustainable agriculture, food technology, and
                environmental biotechnology has grown into a cross-disciplinary
                digital platform celebrating student writers, researchers,
                poets, designers, and innovators from all faculties.
              </p>
            </div>

            {/* Editorial Pull-Quote Block */}
            <div className="relative p-6 sm:p-7 rounded-2xl bg-emerald-50/70 border-l-4 border-[#00C800] border-y border-r shadow-2xs">
              <p className="text-base sm:text-lg font-semibold text-gray-900 italic leading-snug">
                &ldquo;We believe that the best university ideas shouldn&apos;t
                remain locked inside lecture halls or capstone binders. They
                deserve a stage that inspires the next generation of
                thinkers.&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-800">
                <span>The BBST Editorial Board</span>
                <span>•</span>
                <span>Uva Wellassa University</span>
              </div>
            </div>

            {/* 3 Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/70 flex items-center justify-center text-emerald-700">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#171717]">
                  Curiosity-Driven
                </h3>
                <p className="text-xs text-gray-500 leading-normal">
                  Encouraging undergraduates to investigate pressing global
                  challenges.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/70 flex items-center justify-center text-emerald-700">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#171717]">
                  Interdisciplinary
                </h3>
                <p className="text-xs text-gray-500 leading-normal">
                  Connecting engineering, computing, humanities, and sciences.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/70 flex items-center justify-center text-emerald-700">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#171717]">
                  Student-Led
                </h3>
                <p className="text-xs text-gray-500 leading-normal">
                  Authored, edited, designed, and curated completely by
                  students.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Magazine Stack & Authentic Editorial Imagery */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-5 relative flex justify-center"
          >
            <div className="relative w-full max-w-md">
              {/* Primary Background Frame: University Laboratory / Research */}
              <div className="relative w-full aspect-4/5 rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-gray-100">
                <Image
                  src="/images/editorial/science.jpg"
                  alt="Students conducting research at Uva Wellassa University"
                  fill
                  sizes="(max-width: 768px) 100vw, 440px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />

                {/* Bottom text banner */}
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Applied Learning in Action
                  </span>
                  <p className="text-sm font-semibold text-white mt-1">
                    Translating lab discoveries into accessible knowledge for
                    everyone.
                  </p>
                </div>
              </div>

              {/* Overlapping Foreground 3D Magazine Cover */}
              <div className="absolute -bottom-8 -right-4 sm:-right-8 w-44 sm:w-52 aspect-3/4 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white rotate-3 hover:rotate-0 transition-transform duration-300">
                <Image
                  src="/images/Magazine.png"
                  alt="BBST Student Magazine Printed Edition"
                  fill
                  sizes="210px"
                  className="object-contain"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#171717] text-white shadow-xs flex items-center gap-1">
                  <BookOpen className="w-2.5 h-2.5 text-[#00E500]" />
                  <span>Vol 02</span>
                </div>
              </div>

              {/* Editorial Stamp badge */}
              <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-white shadow-lg border-2 border-emerald-300 flex flex-col items-center justify-center p-2 text-center rotate-[-8deg]">
                <Sparkles className="w-4 h-4 text-emerald-600 mb-0.5" />
                <span className="text-[9px] font-extrabold uppercase leading-tight text-gray-900">
                  Authentic UWU Voice
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
