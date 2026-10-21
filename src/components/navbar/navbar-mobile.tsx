"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Send } from "lucide-react";
import { NAV_LINKS } from "./navbar-links";
import { NavbarSearch } from "./navbar-search";
import { NavbarAuth } from "./navbar-auth";

interface NavbarMobileProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitClick: () => void;
}

export function NavbarMobile({
  isOpen,
  onClose,
  onSubmitClick,
}: NavbarMobileProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="lg:hidden apple-glass-drawer px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
      {/* Mobile Search */}
      <NavbarSearch isMobile onSearchSubmit={onClose} />

      {/* Navigation Links */}
      <nav className="flex flex-col space-y-1">
        {NAV_LINKS.map((link) => {
          const isActive = isLinkActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-800 font-bold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => {
            onClose();
            onSubmitClick();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00E500] hover:bg-[#00D000] text-black text-sm font-bold shadow-xs transition-all"
        >
          <Send className="w-4 h-4" />
          <span>Submit Your Article</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <NavbarAuth isMobile onNavigate={onClose} />
      </div>
    </div>
  );
}
