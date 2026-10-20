"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
  Users,
  GraduationCap,
  RefreshCw,
  X,
  SlidersHorizontal,
} from "lucide-react";

export interface PublicWriter {
  id: string;
  name: string;
  slug: string;
  shortBio: string;
  profileImageUrl: string;
  department: string;
  academicYear?: string | null;
  role: string;
  expertise: string[];
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  website?: string | null;
  isFeatured: boolean;
  publishedArticlesCount: number;
}

interface WritersDirectoryProps {
  initialWriters?: PublicWriter[];
  initialDepartments?: string[];
}

export function WritersDirectory({
  initialWriters = [],
  initialDepartments = [],
}: WritersDirectoryProps) {
  const [writers, setWriters] = useState<PublicWriter[]>(initialWriters);
  const [loading, setLoading] = useState(initialWriters.length === 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [sortBy, setSortBy] = useState<"featured" | "name" | "articles">(
    "featured",
  );

  useEffect(() => {
    async function fetchWriters() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (selectedDepartment !== "all")
          params.set("department", selectedDepartment);
        params.set("sortBy", sortBy);

        const res = await fetch(`/api/writers?${params.toString()}`);
        const data = await res.json();
        if (data.writers) {
          setWriters(data.writers);
        }
      } catch (err) {
        console.error("Failed to fetch writers:", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchWriters();
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedDepartment, sortBy]);

  // Extract unique departments for filter
  const departments = useMemo(() => {
    if (initialDepartments.length > 0) return initialDepartments;
    const set = new Set<string>();
    writers.forEach((w) => {
      if (w.department) set.add(w.department);
    });
    return Array.from(set).sort();
  }, [writers, initialDepartments]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-emerald-50/50 via-white to-white py-14 sm:py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs mb-4">
            <Users className="w-3.5 h-3.5 text-[#00C800]" />
            <span>BBST Editorial & Contributors</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#171717] tracking-tight max-w-3xl mx-auto leading-tight">
            Meet Our Writers
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mt-3 leading-relaxed">
            Discover the people behind the stories, ideas, and perspectives that
            shape the BBST Magazine community at Uva Wellassa University.
          </p>

          {/* Search Bar in Hero */}
          <div className="max-w-xl mx-auto mt-8">
            <div className="relative flex items-center shadow-md shadow-gray-200/50 rounded-2xl bg-white border border-gray-200 focus-within:border-[#00C800] focus-within:ring-2 focus-within:ring-[#00C800]/20 transition-all">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search writers by name, department, or research interests..."
                className="w-full pl-12 pr-10 py-3.5 text-xs sm:text-sm rounded-2xl bg-transparent text-[#171717] placeholder:text-gray-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1.5 mr-2.5 rounded-full text-gray-400 hover:text-black transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Filter and Sorting Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-gray-100">
          {/* Department Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedDepartment("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedDepartment === "all"
                  ? "bg-[#171717] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Departments
            </button>

            {departments.slice(0, 5).map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDepartment(dept)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedDepartment === dept
                    ? "bg-[#00E500] text-black font-bold shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "featured" | "name" | "articles")
              }
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00C800] cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="name">Alphabetical (A–Z)</option>
              <option value="articles">Most Published Articles</option>
            </select>
          </div>
        </div>

        {/* Writers Grid */}
        {loading && writers.length === 0 ? (
          <div className="p-16 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#00C800]" />
            <span className="text-sm font-semibold">
              Loading writer profiles...
            </span>
          </div>
        ) : writers.length === 0 ? (
          <div className="p-16 text-center space-y-3 bg-gray-50/60 rounded-3xl border border-gray-100 max-w-xl mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto text-gray-400 shadow-2xs">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              No writers found
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {searchQuery || selectedDepartment !== "all"
                ? "No published writer profiles matched your search or department filter. Try clearing the filters."
                : "No writer profiles are currently published. Check back soon!"}
            </p>
            {(searchQuery || selectedDepartment !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDepartment("all");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#171717] text-white hover:bg-black transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {writers.map((writer) => {
              return (
                <div
                  key={writer.id}
                  className="group relative flex flex-col bg-white rounded-2xl border border-gray-200 hover:border-gray-300 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* Top Header Background Bar */}
                  <div className="h-20 bg-linear-to-r from-emerald-500/10 via-emerald-400/20 to-teal-500/10 relative">
                    {writer.isFeatured && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800 shadow-2xs border border-emerald-200">
                        <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <span>Featured</span>
                      </div>
                    )}
                  </div>

                  {/* Avatar & Main Body */}
                  <div className="p-5 pt-0 flex-1 flex flex-col">
                    {/* Floating Avatar */}
                    <div className="relative -mt-10 mb-3 w-18 h-18 rounded-full overflow-hidden bg-white p-1 shadow-md border border-gray-100">
                      <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={writer.profileImageUrl || "/images/avatar1.jpg"}
                          alt={writer.name}
                          fill
                          sizes="72px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>

                    {/* Name & Title */}
                    <div className="space-y-1 mb-2">
                      <Link
                        href={`/writers/${writer.slug}`}
                        className="font-bold text-base sm:text-lg text-[#171717] group-hover:text-emerald-700 transition-colors block line-clamp-1"
                      >
                        {writer.name}
                      </Link>
                      <p className="text-xs text-gray-500 font-medium line-clamp-1">
                        {writer.role}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{writer.department}</span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed my-2 flex-1">
                      {writer.shortBio}
                    </p>

                    {/* Expertise Tags */}
                    {writer.expertise && writer.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 my-2">
                        {writer.expertise.slice(0, 2).map((exp) => (
                          <span
                            key={exp}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700"
                          >
                            {exp}
                          </span>
                        ))}
                        {writer.expertise.length > 2 && (
                          <span className="text-[10px] text-gray-400 self-center">
                            +{writer.expertise.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Card Footer: Article Count & View Profile Link */}
                    <div className="flex items-center justify-between pt-3.5 mt-auto border-t border-gray-100 text-xs">
                      <div className="flex items-center gap-1 text-gray-500 font-semibold">
                        <BookOpen className="w-3.5 h-3.5 text-[#00C800]" />
                        <span>
                          {writer.publishedArticlesCount}{" "}
                          {writer.publishedArticlesCount === 1
                            ? "article"
                            : "articles"}
                        </span>
                      </div>

                      <Link
                        href={`/writers/${writer.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#171717] group-hover:text-[#00A800] transition-colors"
                      >
                        <span>View Profile</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
