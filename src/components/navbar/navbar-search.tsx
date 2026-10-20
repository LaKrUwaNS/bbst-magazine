"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface NavbarSearchProps {
  onSearchSubmit?: () => void;
  className?: string;
  isMobile?: boolean;
}

export function NavbarSearch({
  onSearchSubmit,
  className = "",
  isMobile = false,
}: NavbarSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/articles?q=${encodeURIComponent(searchQuery.trim())}`);
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input
        type="search"
        placeholder={isMobile ? "Search articles, topics..." : "Search..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`text-xs rounded-full border border-gray-200 bg-gray-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00E500] focus:border-transparent transition-all placeholder:text-gray-400 text-gray-900 ${
          isMobile
            ? "w-full pl-9 pr-3 py-2 text-sm rounded-xl"
            : "w-36 md:w-44 xl:w-52 pl-8 pr-3 py-1.5"
        }`}
      />
      <Search
        className={`text-gray-400 absolute pointer-events-none ${
          isMobile
            ? "w-4 h-4 left-3 top-1/2 -translate-y-1/2"
            : "w-3.5 h-3.5 left-2.5 top-1/2 -translate-y-1/2"
        }`}
      />
    </form>
  );
}
