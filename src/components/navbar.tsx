"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Menu, X, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SubmitArticleDialog } from "@/components/submit-article-dialog";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/articles" },
  { label: "Magazine", href: "/magazines" },
  { label: "Categories", href: "/categories" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/articles?q=${encodeURIComponent(searchQuery.trim())}`);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-17 sm:h-17.5 gap-3 xl:gap-4">
            {/* BBST Open Book Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group focus:outline-none shrink-0"
              aria-label="BBST Magazine Home"
            >
              {/* Green Book Icon */}
              <div className="w-8 h-7 shrink-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 36 28"
                  fill="none"
                  className="w-full h-full drop-shadow-xs"
                >
                  <path
                    d="M18 5C13 1.5 4 1.5 2 3.5V23.5C4 21.5 13 21.5 18 25V5Z"
                    fill="#00E500"
                  />
                  <path
                    d="M18 5C23 1.5 32 1.5 34 3.5V23.5C32 21.5 23 21.5 18 25V5Z"
                    fill="#00C800"
                  />
                  <line
                    x1="18"
                    y1="5"
                    x2="18"
                    y2="25"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* BBST STUDENT MAGAZINE Branding */}
              <div className="flex flex-col">
                <span className="text-[21px] font-black tracking-tight text-[#171717] leading-none">
                  BBST
                </span>
                <span className="text-[8.5px] font-bold tracking-[0.2em] uppercase text-gray-700 leading-tight mt-0.5">
                  Student Magazine
                </span>
              </div>
            </Link>

            {/* Center Navigation Links with Glass Animation */}
            <nav
              aria-label="Main Navigation"
              onMouseLeave={() => setHoveredLink(null)}
              className="relative hidden lg:flex items-center p-1.5 bg-gray-100/80 backdrop-blur-md rounded-full border border-gray-200/80 shadow-2xs gap-1"
            >
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(`${link.href}/`));
                const isHovered = hoveredLink === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={() => setHoveredLink(link.href)}
                    className={`relative flex items-center px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold transition-colors duration-200 whitespace-nowrap cursor-pointer select-none isolate ${
                      isActive
                        ? "text-white font-bold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {/* Active Tab Spring Indicator Pill */}
                    {isActive && (
                      <motion.div
                        layoutId={shouldReduceMotion ? undefined : "activeNavbarTabPill"}
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 32,
                        }}
                        className="absolute inset-0 bg-[#00C800] rounded-full shadow-md shadow-[#00C800]/30 -z-10"
                      />
                    )}

                    {/* Smooth Hover State Indicator Pill */}
                    {!isActive && isHovered && (
                      <motion.div
                        layoutId={shouldReduceMotion ? undefined : "hoverNavbarTabPill"}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-white rounded-full shadow-xs -z-10 border border-gray-200/60"
                      />
                    )}

                    <span className="relative z-10 tracking-tight">{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side: Search, Login & Submit Article */}
            <div className="hidden sm:flex items-center gap-2.5 xl:gap-3 shrink-0">
              {/* Article Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="search"
                  placeholder="Search articles, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 md:w-52 lg:w-56 pl-8 pr-3 py-1.5 text-xs rounded-full border border-gray-200 bg-gray-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00E500] focus:border-transparent transition-all placeholder:text-gray-400 text-gray-900"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </form>

              {/* Login Button */}
              <Link
                href="/about"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-gray-200 text-[#171717] hover:bg-gray-50 transition-colors shadow-2xs"
              >
                Login
              </Link>

              {/* Submit Article Button (Vibrant Green Pill with arrow) */}
              <button
                type="button"
                onClick={() => setSubmitDialogOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black transition-all hover:scale-[1.02] active:scale-95 shadow-xs group cursor-pointer"
              >
                <span>Submit Article</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setSubmitDialogOpen(true)}
                className="px-3 py-1 text-xs font-bold bg-[#00E500] text-black rounded-full flex items-center gap-1"
              >
                <span>Submit</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="search"
                placeholder="Search articles, topics, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00E500]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <nav className="flex flex-col space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    pathname === link.href
                      ? "bg-gray-100 text-[#00C800] font-bold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setSubmitDialogOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00E500] hover:bg-[#00D000] text-black text-sm font-bold shadow-sm"
            >
              <span>Submit Your Article</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* Submit Dialog Controlled Instance */}
      <SubmitArticleDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
      />
    </>
  );
}
