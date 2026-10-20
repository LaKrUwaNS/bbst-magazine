"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Building,
  Share2,
  CalendarPlus,
  Check,
  ArrowRight,
} from "lucide-react";
import { MagazineEvent } from "@/types/event";
import {
  formatEventDate,
  formatEventTimeRange,
  downloadEventIcs,
} from "@/lib/events/event-date-utils";

interface EventDetailModalProps {
  event: MagazineEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailModal({
  event,
  isOpen,
  onClose,
}: EventDetailModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Body scroll locking
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!event) return null;

  const { monthFull, day, year } = formatEventDate(event.startAt);
  const timeRange = formatEventTimeRange(event.startAt, event.endAt);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.excerpt,
          url: url,
        });
        return;
      } catch {
        // User cancelled or not supported, fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(`${url}#${event.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleAddToCalendar = () => {
    downloadEventIcs(event);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={event.title}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          {/* 1. Backdrop with Apple-inspired Glass Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#171717]/60 backdrop-blur-md"
          />

          {/* 2. Modal Container */}
          <motion.div
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: 16 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: 16 }
            }
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-2xl overflow-hidden z-10 my-auto"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close event details"
              className="absolute top-3.5 right-3.5 z-30 p-2 rounded-full bg-white/90 backdrop-blur-md border border-gray-200/80 text-gray-700 hover:text-black hover:bg-white transition-colors cursor-pointer shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto overscroll-contain">
              {/* Event Hero Cover */}
              <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-gray-100">
                <Image
                  src={event.coverImage}
                  alt={event.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                {/* Badges on Top Left */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#00E500] text-black shadow-xs">
                    {event.category}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/40 backdrop-blur-md text-white border border-white/20">
                    {event.status === "upcoming"
                      ? "Upcoming"
                      : event.status === "ongoing"
                        ? "Live Now"
                        : "Past Event"}
                  </span>
                </div>

                {/* Title inside bottom of hero for mobile & desktop */}
                <div className="absolute bottom-4 left-4 right-4 z-20 text-white">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight drop-shadow-xs">
                    {event.title}
                  </h2>
                </div>
              </div>

              {/* Main Information Body */}
              <div className="p-5 sm:p-7 space-y-6">
                {/* Key Event Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs sm:text-sm">
                  {/* Date */}
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 h-8 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-[#00C800] shrink-0 shadow-2xs">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block leading-none mb-0.5">
                        Date
                      </span>
                      <span className="font-semibold text-gray-900">
                        {monthFull} {day}, {year}
                      </span>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 h-8 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-[#00C800] shrink-0 shadow-2xs">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block leading-none mb-0.5">
                        Time
                      </span>
                      <span className="font-semibold text-gray-900">
                        {timeRange}
                      </span>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 h-8 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-[#00C800] shrink-0 shadow-2xs">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block leading-none mb-0.5">
                        Location
                      </span>
                      <span className="font-semibold text-gray-900">
                        {event.venue}
                      </span>
                    </div>
                  </div>

                  {/* Organizer */}
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 h-8 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-[#00C800] shrink-0 shadow-2xs">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block leading-none mb-0.5">
                        Organizer
                      </span>
                      <span className="font-semibold text-gray-900 truncate block">
                        {event.organizer}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Overview */}
                <div>
                  <h3 className="text-base font-bold text-[#171717] mb-2">
                    About this Event
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>

                {/* Event Agenda (if provided) */}
                {event.agenda && event.agenda.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-[#171717] mb-3">
                      Event Schedule &amp; Agenda
                    </h3>
                    <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden bg-white">
                      {event.agenda.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3.5 hover:bg-gray-50/70 transition-colors text-xs sm:text-sm"
                        >
                          <span className="font-bold text-[#00A800] w-24 shrink-0">
                            {item.time}
                          </span>
                          <span className="font-semibold text-gray-800 flex-1 px-2">
                            {item.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Who Can Participate */}
                {event.audience && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5 text-xs text-gray-700">
                    <Users className="w-4 h-4 text-[#00C800] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-900 block mb-0.5">
                        Eligibility &amp; Target Audience
                      </span>
                      <span>{event.audience}</span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Action Bar Footer */}
              <div className="sticky bottom-0 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-5 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg">
                {/* Secondary Actions: Add to calendar + Share */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddToCalendar}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 text-gray-800 transition-colors cursor-pointer"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-[#00C800]" />
                    <span>Add to Calendar (.ics)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 text-gray-800 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#00C800]" />
                        <span className="text-[#00C800]">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-gray-500" />
                        <span>Share Event</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Primary Action: Demo Registration */}
                <button
                  type="button"
                  onClick={() => setRegistered(true)}
                  disabled={registered || event.status === "past"}
                  className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer ${event.status === "past"
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : registered
                        ? "bg-emerald-600 text-white"
                        : "bg-[#00E500] hover:bg-[#00D000] text-black hover:scale-[1.01] active:scale-98"
                    }`}
                >
                  {registered ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Registered (Demo Seat Reserved)</span>
                    </>
                  ) : event.status === "past" ? (
                    <span>Event Concluded</span>
                  ) : (
                    <>
                      <span>Register for Event</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
