"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Camera, MapPin } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  caption: string;
  src: string;
  aspectClass: string;
  colSpanClass: string;
  location?: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Uva Wellassa Campus Environment",
    category: "Campus & Landscape",
    caption:
      "Perched on the scenic hillside of Badulla — the university provides an inspiring natural setting for academic inquiry and student life.",
    src: "/uva-imageee.jpg",
    aspectClass: "aspect-16/9 sm:aspect-21/9",
    colSpanClass: "md:col-span-12",
    location: "Badulla, Sri Lanka",
  },
  {
    id: "gal-2",
    title: "Applied Sciences & Biotechnology Lab",
    category: "Scientific Research",
    caption:
      "Students exploring microbial analysis, soil enrichment, and biochemical assays in the Faculty of Applied Sciences.",
    src: "/images/editorial/science.jpg",
    aspectClass: "aspect-4/3",
    colSpanClass: "md:col-span-6 lg:col-span-6",
    location: "Science Complex",
  },
  {
    id: "gal-3",
    title: "Sustainable Agriculture & Biofertilizer Trials",
    category: "Biosystems Innovation",
    caption:
      "Field experimentation turning organic waste into high-yield agricultural solutions for regional farming communities.",
    src: "/images/editorial/agriculture.jpg",
    aspectClass: "aspect-4/3",
    colSpanClass: "md:col-span-6 lg:col-span-6",
    location: "Agri-Tech Field Station",
  },
  {
    id: "gal-4",
    title: "Technology, Computing & Systems",
    category: "Digital Frontier",
    caption:
      "Undergraduate software development, AI models, and electronic prototypes built to solve national challenges.",
    src: "/images/editorial/technology.jpg",
    aspectClass: "aspect-4/3",
    colSpanClass: "md:col-span-6 lg:col-span-4",
    location: "Computing Labs",
  },
  {
    id: "gal-5",
    title: "Arts, Literature & Creative Writing",
    category: "Culture & Expression",
    caption:
      "Celebrating poetry, literary translation, design thinking, and artistic talent across our student community.",
    src: "/images/editorial/arts.jpg",
    aspectClass: "aspect-4/3",
    colSpanClass: "md:col-span-6 lg:col-span-4",
    location: "Student Centre",
  },
  {
    id: "gal-6",
    title: "Student Community & Campus Dialogue",
    category: "University Life",
    caption:
      "Collaborative study sessions, open forums, and community moments that inspire every edition of BBST Magazine.",
    src: "/images/editorial/campus.jpg",
    aspectClass: "aspect-4/3",
    colSpanClass: "md:col-span-12 lg:col-span-4",
    location: "Main Quadrangle",
  },
];

export function AboutGallery() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-20 lg:py-28 bg-gray-50/70 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200">
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            Visual Archive
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
            A Visual Journey Through Our Community
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            From hillside lecture halls to cutting-edge research benches, experience the
            vibrant academic environment of Uva Wellassa University.
          </p>
        </div>

        {/* Editorial Masonry/Asymmetrical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          {GALLERY_ITEMS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: index * 0.07, ease: "easeOut" }}
              className={`group relative rounded-3xl overflow-hidden bg-white border border-gray-200/90 shadow-sm hover:shadow-xl transition-all duration-300 ${item.colSpanClass}`}
            >
              <div className={`relative w-full overflow-hidden ${item.aspectClass}`}>
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Dark Gradient Overlay for Legibility */}
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/5 opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Top Badge: Category */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md text-emerald-400 border border-white/20">
                    {item.category}
                  </span>
                </div>

                {/* Location indicator */}
                {item.location && (
                  <div className="absolute top-4 right-4 hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/40 backdrop-blur-md text-white/90 border border-white/10">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{item.location}</span>
                  </div>
                )}

                {/* Caption and Title Container */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 leading-relaxed">
                    {item.caption}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
