"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Calendar,
  MapPin,
  Building,
  Users,
  Tag,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { EventFormData } from "./event-modal-dialog";

interface EventPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventFormData | null;
  onPublishNow?: (eventId: string) => Promise<void>;
}

export function EventPreviewModal({
  isOpen,
  onClose,
  event,
  onPublishNow,
}: EventPreviewModalProps) {
  const [publishing, setPublishing] = useState(false);

  if (!isOpen || !event) return null;

  const startDateFormatted = new Date(event.startAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const startTimeFormatted = new Date(event.startAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTimeFormatted = new Date(event.endAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePublish = async () => {
    if (!event.id || !onPublishNow) return;
    setPublishing(true);
    try {
      await onPublishNow(event.id);
      onClose();
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              {event.category}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                event.publicationStatus === "PUBLISHED"
                  ? "bg-[#00E500] text-black"
                  : event.publicationStatus === "DRAFT"
                  ? "bg-amber-100 text-amber-900"
                  : "bg-gray-800 text-white"
              }`}
            >
              {event.publicationStatus}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Preview Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-sm">
          {/* Cover Image Banner */}
          {event.coverImage && (
            <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
              <Image
                src={event.coverImage}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Title & Excerpt */}
          <div className="space-y-2">
            <h1
              id="preview-modal-title"
              className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight leading-snug"
            >
              {event.title}
            </h1>
            {event.excerpt && (
              <p className="text-gray-600 text-sm leading-relaxed italic">
                {event.excerpt}
              </p>
            )}
          </div>

          {/* Key Facts Pill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
            <div className="flex items-center gap-2.5 text-xs text-gray-700">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">{startDateFormatted}</p>
                <p className="text-gray-500 font-mono text-[11px]">
                  {startTimeFormatted} &ndash; {endTimeFormatted} ({event.timezone})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-gray-700">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">{event.venue}</p>
                <p className="text-gray-500 text-[11px]">Main Campus Location</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-gray-700">
              <Building className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">{event.organizer}</p>
                <p className="text-gray-500 text-[11px]">Host / Department</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-gray-700">
              <Users className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">
                  {event.capacity ? `${event.capacity} Seats Available` : "Open Attendance"}
                </p>
                <p className="text-gray-500 text-[11px]">
                  {event.audience || "General Academic Community"}
                </p>
              </div>
            </div>
          </div>

          {/* Description Narrative */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              About This Event
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-400 mr-1" />
                {event.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">
          <a
            href="/events"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Events Hub</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Close Preview
            </button>
            {event.publicationStatus === "DRAFT" && onPublishNow && event.id && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {publishing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Publish to Public Page</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
