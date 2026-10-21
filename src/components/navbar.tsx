"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X, Send } from "lucide-react";
import { SubmitArticleDialog } from "@/components/submit-article-dialog";
import { NavbarLogo } from "./navbar/navbar-logo";
import { NavbarLinks } from "./navbar/navbar-links";
import { NavbarSearch } from "./navbar/navbar-search";
import { NavbarAuth } from "./navbar/navbar-auth";
import { NavbarMobile } from "./navbar/navbar-mobile";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Remove main navigation bar from the editor views
  if (pathname.startsWith("/admin") || pathname === "/login") {
    return null;
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full apple-glass-nav ${
          scrolled ? "is-scrolled" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-17 sm:h-18 gap-3 lg:gap-4">
            {/* Zone 1: Left Brand Logo */}
            <NavbarLogo />

            {/* Zone 2: Center Navigation Links (Single active highlight pill) */}
            <NavbarLinks />

            {/* Zone 3: Right Controls (Search, Auth, and Submit CTA) */}
            <div className="hidden lg:flex items-center gap-2.5 xl:gap-3 shrink-0">
              {/* Search Field */}
              <NavbarSearch />

              {/* Dynamic Login / Dashboard Button */}
              <NavbarAuth />

              {/* Submit Article CTA Button */}
              <Link
                href="/submit-article"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black transition-all hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-[0_4px_14px_rgba(0,229,0,0.3)] border border-emerald-400/40 group cursor-pointer shrink-0"
              >
                <span>Submit Article</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Mobile Actions: Quick Submit & Hamburger Menu */}
            <div className="flex lg:hidden items-center gap-2">
              <Link
                href="/submit-article"
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-[#00E500] text-black rounded-full shadow-2xs"
              >
                <Send className="w-3 h-3" />
                <span>Submit</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
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

        {/* Mobile Dropdown Drawer */}
        <NavbarMobile
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onSubmitClick={() => setSubmitDialogOpen(true)}
        />
      </header>

      {/* Controlled Submit Article Dialog Instance */}
      <SubmitArticleDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
      />
    </>
  );
}
