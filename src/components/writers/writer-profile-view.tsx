"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Calendar,
  Globe,
  Mail,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export interface WriterDetailData {
  id: string;
  name: string;
  slug: string;
  bio: string;
  shortBio: string;
  profileImageUrl: string;
  department: string;
  academicYear?: string | null;
  role: string;
  expertise: string[];
  website?: string | null;
  email?: string | null;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  isFeatured: boolean;
  publishedArticlesCount: number;
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string;
    category?: { id: string; name: string; slug: string } | null;
    publishedAt: string;
  }>;
}

interface WriterProfileViewProps {
  writer: WriterDetailData;
}

export function WriterProfileView({ writer }: WriterProfileViewProps) {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-gray-100 bg-gray-50/50 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/writers"
              className="hover:text-black transition-colors"
            >
              Writers
            </Link>
            <span>/</span>
            <span className="text-[#171717] font-bold truncate max-w-50">
              {writer.name}
            </span>
          </nav>

          <Link
            href="/writers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Writers</span>
          </Link>
        </div>
      </div>

      {/* Profile Header & Hero Banner */}
      <section className="relative overflow-hidden bg-linear-to-b from-emerald-50/40 via-white to-white pt-10 sm:pt-14 pb-8 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 text-center md:text-left">
            {/* Profile Avatar */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-white p-1.5 shadow-lg border-2 border-emerald-100 shrink-0">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={writer.profileImageUrl || "/images/avatar1.jpg"}
                  alt={writer.name}
                  fill
                  sizes="(max-width: 640px) 112px, 144px"
                  priority
                  className="object-cover"
                />
              </div>
            </div>

            {/* Writer Bio & Details */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#171717] tracking-tight">
                  {writer.name}
                </h1>
                {writer.isFeatured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span>Featured Contributor</span>
                  </span>
                )}
              </div>

              {/* Roles & Affiliations */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs sm:text-sm text-gray-600 font-medium">
                <span className="font-bold text-[#171717]">{writer.role}</span>
                <span className="text-gray-300">•</span>
                <div className="inline-flex items-center gap-1 text-gray-600">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>{writer.department}</span>
                </div>
                {writer.academicYear && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500 font-mono text-xs">
                      {writer.academicYear}
                    </span>
                  </>
                )}
              </div>

              {/* Short Bio */}
              {writer.shortBio && (
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl">
                  {writer.shortBio}
                </p>
              )}

              {/* Stats & Social Bar */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                {/* Published Articles Count Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                  <BookOpen className="w-3.5 h-3.5 text-[#00C800]" />
                  <span>
                    {writer.publishedArticlesCount}{" "}
                    {writer.publishedArticlesCount === 1
                      ? "Published Article"
                      : "Published Articles"}
                  </span>
                </div>

                {/* Social and Website Links */}
                <div className="flex items-center gap-2">
                  {writer.socialLinks.linkedin && (
                    <a
                      href={writer.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${writer.name} LinkedIn Profile`}
                      className="p-1.5 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 transition-colors"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  )}

                  {writer.socialLinks.twitter && (
                    <a
                      href={writer.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${writer.name} Twitter Profile`}
                      className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-black border border-gray-200 transition-colors"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  )}

                  {writer.socialLinks.github && (
                    <a
                      href={writer.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${writer.name} GitHub Profile`}
                      className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-black border border-gray-200 transition-colors"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </a>
                  )}

                  {writer.website && (
                    <a
                      href={writer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${writer.name} Personal Website`}
                      className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-black border border-gray-200 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}

                  {writer.email && (
                    <a
                      href={`mailto:${writer.email}`}
                      aria-label={`Email ${writer.name}`}
                      className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-black border border-gray-200 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container: Bio & Articles */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        {/* Full Biography & Interests Section */}
        <section className="space-y-6">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
              About the Writer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bio text */}
            <div className="md:col-span-2 space-y-4">
              {writer.bio ? (
                <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                  {writer.bio}
                </div>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  {writer.shortBio || "No extended biography provided."}
                </p>
              )}
            </div>

            {/* Sidebar Details: Areas of Interest & Affiliation Details */}
            <div className="space-y-5 bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 self-start">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Academic & Research Profile
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">
                    Affiliation
                  </span>
                  <span className="font-bold text-gray-900 block mt-0.5">
                    {writer.department}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block font-medium">Role</span>
                  <span className="font-bold text-gray-900 block mt-0.5">
                    {writer.role}
                  </span>
                </div>

                {writer.academicYear && (
                  <div>
                    <span className="text-gray-400 block font-medium">
                      Batch / Year
                    </span>
                    <span className="font-bold text-gray-900 block mt-0.5 font-mono">
                      {writer.academicYear}
                    </span>
                  </div>
                )}

                {writer.expertise && writer.expertise.length > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-gray-400 block font-medium mb-1.5">
                      Areas of Interest
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {writer.expertise.map((exp) => (
                        <span
                          key={exp}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-gray-200 text-emerald-800"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Published Articles Collection */}
        <section className="space-y-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
                Published Articles
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Articles, columns, and editorial contributions authored by{" "}
                {writer.name}.
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {writer.articles.length}{" "}
              {writer.articles.length === 1 ? "Story" : "Stories"}
            </span>
          </div>

          {writer.articles.length === 0 ? (
            <div className="p-12 text-center bg-gray-50/60 rounded-3xl border border-gray-200 max-w-lg mx-auto">
              <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-gray-900">
                No published articles yet
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Articles written by {writer.name} will be displayed here once
                approved and published.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {writer.articles.map((article) => (
                <div
                  key={article.id}
                  className="group relative flex flex-col bg-white rounded-2xl border border-gray-200 hover:border-gray-300 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* Cover Image */}
                  <div className="relative w-full h-44 overflow-hidden bg-gray-100">
                    <Image
                      src={article.coverImage || "/images/Magazine.png"}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {article.category && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#00E500] text-black shadow-xs">
                          {article.category.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-base text-[#171717] group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug mb-2">
                      <Link href={`/articles/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>

                    {article.excerpt && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-100 text-xs text-gray-400">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{article.publishedAt}</span>
                      </div>

                      <Link
                        href={`/articles/${article.slug}`}
                        className="inline-flex items-center gap-1 font-bold text-xs text-[#171717] group-hover:text-[#00A800] transition-colors"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
