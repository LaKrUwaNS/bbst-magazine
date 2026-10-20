"use client";

import React from "react";
import { Megaphone, ArrowRight } from "lucide-react";

interface SuggestEventWidgetProps {
  onOpenSuggestModal: () => void;
}

export function SuggestEventWidget({
  onOpenSuggestModal,
}: SuggestEventWidgetProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/60 to-white p-5 sm:p-6 shadow-2xs text-center">
      {/* Decorative subtle ambient circle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#00FF00]/10 blur-2xl"
      />

      {/* Megaphone Icon Badge */}
      <div className="mx-auto w-12 h-12 rounded-full bg-white border border-emerald-100 shadow-2xs flex items-center justify-center text-[#00C800] mb-3">
        <Megaphone className="w-5 h-5" />
      </div>

      {/* Heading */}
      <h3 className="font-extrabold text-base text-[#171717] mb-1">
        Have an Event Idea?
      </h3>

      {/* Description */}
      <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto leading-relaxed">
        Let us know about upcoming events, workshops, and student community activities.
      </p>

      {/* Suggest an Event Button matching screenshot */}
      <button
        type="button"
        onClick={onOpenSuggestModal}
        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#00E500] hover:bg-[#00D000] text-black transition-all hover:scale-[1.01] active:scale-98 shadow-xs cursor-pointer group"
      >
        <span>Suggest an Event</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
