"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Megaphone, CheckCircle2, ArrowRight } from "lucide-react";

interface SuggestEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuggestEventModal({ isOpen, onClose }: SuggestEventModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("WORKSHOP");
  const [suggestedDate, setSuggestedDate] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !email.trim()) {
      setError("Please complete all required fields.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/events/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          suggestedDate: suggestedDate.trim() || undefined,
          venue: venue.trim() || undefined,
          description: description.trim(),
          email: email.trim(),
          organizerName: email.split("@")[0] || "Event Organizer",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit event proposal.");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send event proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setCategory("WORKSHOP");
    setSuggestedDate("");
    setVenue("");
    setDescription("");
    setEmail("");
    setSubmitted(false);
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Suggest an Event"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#171717]/60 backdrop-blur-md"
          />

          {/* Modal Card */}
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
            className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-2xl overflow-hidden z-10 my-auto p-5 sm:p-7"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {submitted ? (
              /* Success confirmation state */
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#00C800] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-[#171717]">
                  Event Suggestion Received!
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Thank you for contributing to our campus community. The BBST Editorial Board will review your proposal and get in touch via <strong>{email}</strong>.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black transition-all cursor-pointer shadow-xs"
                  >
                    <span>Done</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Suggest Event Form */
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00C800] flex items-center justify-center shrink-0">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#171717]">
                      Suggest an Event
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Submit an event proposal for BBST Student Magazine coverage.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-3">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
                  {/* Title */}
                  <div>
                    <label
                      htmlFor="s-title"
                      className="block text-xs font-bold text-gray-700 mb-1"
                    >
                      Event Title *
                    </label>
                    <input
                      id="s-title"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. AI Prompting Workshop"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C800] focus:ring-2 focus:ring-[#00C800]/20"
                    />
                  </div>

                  {/* Category & Date Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="s-cat"
                        className="block text-xs font-bold text-gray-700 mb-1"
                      >
                        Category
                      </label>
                      <select
                        id="s-cat"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C800] bg-white cursor-pointer"
                      >
                        <option value="WORKSHOP">Workshop</option>
                        <option value="SEMINAR">Seminar</option>
                        <option value="COMPETITION">Competition</option>
                        <option value="PANEL DISCUSSION">Panel Discussion</option>
                        <option value="CULTURAL">Cultural Event</option>
                        <option value="NETWORKING">Networking Session</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="s-date"
                        className="block text-xs font-bold text-gray-700 mb-1"
                      >
                        Suggested Date
                      </label>
                      <input
                        id="s-date"
                        type="date"
                        value={suggestedDate}
                        onChange={(e) => setSuggestedDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C800]"
                      >
                      </input>
                    </div>
                  </div>

                  {/* Venue */}
                  <div>
                    <label
                      htmlFor="s-venue"
                      className="block text-xs font-bold text-gray-700 mb-1"
                    >
                      Proposed Venue
                    </label>
                    <input
                      id="s-venue"
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="e.g. Main Auditorium / Zoom"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C800]"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="s-desc"
                      className="block text-xs font-bold text-gray-700 mb-1"
                    >
                      Description &amp; Objectives *
                    </label>
                    <textarea
                      id="s-desc"
                      rows={3}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell us what this event is about, who is invited, and the main topics..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C800] resize-none"
                    />
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label
                      htmlFor="s-email"
                      className="block text-xs font-bold text-gray-700 mb-1"
                    >
                      Your University Email *
                    </label>
                    <input
                      id="s-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@bbst.ac.lk"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#00C800]"
                    />
                  </div>

                  {/* Notice */}
                  <p className="text-[11px] text-gray-500">
                    Your proposal will be transmitted directly to the BBST Editorial Board and an automated receipt will be emailed to your address.
                  </p>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#00E500] hover:bg-[#00D000] text-black transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{isSubmitting ? "Submitting Proposal..." : "Submit Event Proposal"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
