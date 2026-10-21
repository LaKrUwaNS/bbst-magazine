"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/articles" },
  { label: "Magazine", href: "/magazines" },
  { label: "Categories", href: "/categories" },
  { label: "Writers", href: "/writers" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
];

export function NavbarLinks() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      aria-label="Main Navigation"
      className="relative hidden lg:flex items-center p-1 apple-glass-capsule rounded-full gap-0.5"
    >
      {NAV_LINKS.map((link) => {
        const isActive = isLinkActive(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer select-none isolate ${
              isActive
                ? "text-black font-extrabold"
                : "text-gray-600 hover:text-black hover:bg-white/60"
            }`}
          >
            {/* Single definitive Active Tab Spring Pill — only one link ever gets highlighted */}
            {isActive && (
              <motion.div
                layoutId={shouldReduceMotion ? undefined : "activeNavPill"}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 32,
                }}
                className="absolute inset-0 bg-[#00C800] rounded-full shadow-md shadow-[#00C800]/30 -z-10"
              />
            )}

            <span className="relative z-10 tracking-tight">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
