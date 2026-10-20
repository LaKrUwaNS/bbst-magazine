"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Users2, Mail, GraduationCap } from "lucide-react";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  avatar: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
}

const DEFAULT_EDITORIAL_BOARD: TeamMember[] = [
  {
    id: "team-1",
    name: "Nimsara Jayasuriya",
    role: "Editor-in-Chief",
    department: "Computer Science & Informatics",
    bio: "Undergraduate passionate about artificial intelligence, educational accessibility, and student journalism.",
    avatar: "/images/avatar1.jpg",
    email: "editor@bbst.uwu.ac.lk",
    linkedin: "https://linkedin.com",
  },
  {
    id: "team-2",
    name: "Kasun Wickramasinghe",
    role: "Associate Editor — Sciences",
    department: "Faculty of Applied Sciences",
    bio: "Undergraduate researcher focused on sustainable soil enrichment, microbial technology, and circular agriculture.",
    avatar: "/images/avatar2.jpg",
    email: "kasun@bbst.uwu.ac.lk",
    linkedin: "https://linkedin.com",
  },
  {
    id: "team-3",
    name: "Sanduni Fernando",
    role: "Features & Culture Editor",
    department: "Department of Humanities",
    bio: "Campus photojournalist and writer exploring student culture, creative expression, and university dialogue.",
    avatar: "/images/avatar3.jpg",
    email: "sanduni@bbst.uwu.ac.lk",
    linkedin: "https://linkedin.com",
  },
  {
    id: "team-4",
    name: "Dulanjana Perera",
    role: "Creative & Production Lead",
    department: "Faculty of Engineering",
    bio: "Specializes in digital publication layouts, visual storytelling, and renewable energy technology systems.",
    avatar: "/images/avatar4.jpg",
    email: "dulanjana@bbst.uwu.ac.lk",
    linkedin: "https://linkedin.com",
  },
];

interface AboutTeamProps {
  customMembers?: TeamMember[];
}

export function AboutTeam({ customMembers }: AboutTeamProps) {
  const shouldReduceMotion = useReducedMotion();
  const members = customMembers && customMembers.length > 0 ? customMembers : DEFAULT_EDITORIAL_BOARD;

  return (
    <section id="editorial-team" className="py-20 lg:py-28 bg-white border-t border-gray-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200">
            <Users2 className="w-3.5 h-3.5 text-emerald-600" />
            Editorial Leadership
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
            Meet the Editorial Team
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            The dedicated undergraduates who curate, fact-check, design, and publish each
            issue of BBST Magazine under university faculty guidance.
          </p>
        </div>

        {/* Team Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              className="group relative rounded-3xl bg-white border border-gray-200/90 hover:border-[#00C800] hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Avatar Photo Frame */}
              <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                <Image
                  src={member.avatar}
                  alt={member.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {/* Role Badge pinned on image */}
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-[#171717] shadow-sm">
                    {member.role}
                  </span>
                </div>
              </div>

              {/* Bio & Details Container */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#171717] tracking-tight group-hover:text-emerald-800 transition-colors">
                    {member.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="line-clamp-1">{member.department}</span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 pt-1">
                    {member.bio}
                  </p>
                </div>

                {/* Social & Contact Bar */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    BBST Board
                  </span>
                  <div className="flex items-center gap-2">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        aria-label={`Email ${member.name}`}
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#00E500] hover:text-black flex items-center justify-center text-gray-600 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`LinkedIn profile of ${member.name}`}
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#00E500] hover:text-black flex items-center justify-center text-gray-600 transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Editorial Notice Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-center max-w-3xl mx-auto space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Open Call for Contributors
          </p>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            BBST Magazine is an open student publication under the Faculty of Applied Sciences,
            Uva Wellassa University. New contributing writers, peer reviewers, and graphic designers
            are welcomed at the start of each academic semester.
          </p>
        </div>
      </div>
    </section>
  );
}
