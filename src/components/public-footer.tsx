"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PublicFooter() {
  const pathname = usePathname();

  // Hide public footer in the editor administration view and login pages
  if (pathname.startsWith("/admin") || pathname === "/login") {
    return null;
  }

  return (
    <footer className="border-t border-gray-100 bg-gray-50/60 py-12 text-sm text-gray-500 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-[#171717]">BBST Magazine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00]" />
          </div>
          <p className="text-xs text-gray-400">
            Student Voices for a Brighter Tomorrow • University Student Publication
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-gray-600">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <Link href="/articles" className="hover:text-black transition-colors">Articles</Link>
          <Link href="/magazines" className="hover:text-black transition-colors">Magazines</Link>
          <Link href="/categories" className="hover:text-black transition-colors">Categories</Link>
          <Link href="/events" className="hover:text-black transition-colors">Events</Link>
          <Link href="/about" className="hover:text-black transition-colors">About</Link>
        </div>
        <p className="text-xs text-gray-400 text-center md:text-right">
          &copy; 2025 BBST Magazine. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
