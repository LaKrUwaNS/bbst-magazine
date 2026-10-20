import React from "react";
import Link from "next/link";

export function NavbarLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 group focus:outline-none shrink-0"
      aria-label="BBST Magazine Home"
    >
      {/* Green Open Book Logo Icon */}
      <div className="w-8 h-7 shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 36 28"
          fill="none"
          className="w-full h-full drop-shadow-xs group-hover:scale-105 transition-transform"
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

      {/* Brand Name Typography */}
      <div className="flex flex-col">
        <span className="text-[20px] font-black tracking-tight text-[#171717] leading-none">
          BBST
        </span>
        <span className="text-[8.5px] font-bold tracking-[0.2em] uppercase text-gray-700 leading-tight mt-0.5">
          Student Magazine
        </span>
      </div>
    </Link>
  );
}
