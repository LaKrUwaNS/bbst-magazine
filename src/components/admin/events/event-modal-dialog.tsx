"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Building,
  Upload,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export interface EventFormData {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  description: string;
  category: string;
  categorySlug: string;
  coverImage?: string | null;
  coverImagePublicId?: string | null;
  startAt: string;
  endAt: string;
  timezone: string;
  venue: string;
  organizer: string;
  participantCount?: string | null;
  capacity?: number | null;
  audience?: string | null;
  tags?: string[];
  isFeatured: boolean;
  publicationStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  suggestionId?: string | null;
}

interface EventModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: EventFormData | null;
}

const EVENT_CATEGORIES = [
  { name: "Seminars & Workshops", category: "WORKSHOP", slug: "workshops" },
  { name: "Student Activities & Clubs", category: "CULTURAL", slug: "student-activities" },
  { name: "Competitions & Innovation", category: "COMPETITION", slug: "competitions" },
  { name: "Community & Networking", category: "COMMUNITY", slug: "community" },
  { name: "Academic Seminars", category: "SEMINAR", slug: "workshops" },
  { name: "Panel Discussions", category: "PANEL DISCUSSION", slug: "workshops" },
  { name: "Career Networking", category: "NETWORKING", slug: "community" },
];

function formatForDateTimeInput(iso?: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

export function EventModalDialog({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: EventModalDialogProps) {
  if (!isOpen) return null;

  return (
    <EventModalContent
      key={initialData?.id || initialData?.suggestionId || "new-event"}
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      initialData={initialData}
    />
  );
}

function EventModalContent({
  onClose,
  onSuccess,
  initialData,
}: EventModalDialogProps) {
  const isEditing = Boolean(initialData?.id);

  // Form State initialized directly from initialData without requiring useEffect setState
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "WORKSHOP");
  const [categorySlug, setCategorySlug] = useState(initialData?.categorySlug || "workshops");
  const [coverImage, setCoverImage] = useState(
    initialData?.coverImage || (isEditing ? "" : "/images/editorial/technology.jpg")
  );
  const [coverImagePublicId, setCoverImagePublicId] = useState(
    initialData?.coverImagePublicId || ""
  );
  const [startAt, setStartAt] = useState(() => {
    if (initialData?.startAt) return formatForDateTimeInput(initialData.startAt);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return formatForDateTimeInput(tomorrow.toISOString());
  });
  const [endAt, setEndAt] = useState(() => {
    if (initialData?.endAt) return formatForDateTimeInput(initialData.endAt);
    const tomorrowEnd = new Date();
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    tomorrowEnd.setHours(13, 0, 0, 0);
    return formatForDateTimeInput(tomorrowEnd.toISOString());
  });
  const [timezone] = useState("Asia/Colombo");
  const [venue, setVenue] = useState(
    initialData?.venue || (isEditing ? "" : "Faculty of Technological Studies, UWU")
  );
  const [organizer, setOrganizer] = useState(
    initialData?.organizer || (isEditing ? "" : "BBST Student Editorial Board")
  );
  const [capacity, setCapacity] = useState(() =>
    initialData?.capacity ? initialData.capacity.toString() : (isEditing ? "" : "60")
  );
  const [audience, setAudience] = useState(
    initialData?.audience || (isEditing ? "" : "Undergraduates & Academic Community")
  );
  const [tagsInput, setTagsInput] = useState(() =>
    initialData?.tags && initialData.tags.length > 0
      ? initialData.tags.join(", ")
      : (isEditing ? "" : "Workshop, Technology, Student Community")
  );
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [publicationStatus, setPublicationStatus] = useState<
    "DRAFT" | "PUBLISHED" | "ARCHIVED"
  >(initialData?.publicationStatus || "DRAFT");
  const [suggestionId] = useState<string | null>(initialData?.suggestionId || null);

  // Status & Validation
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Auto-generate slug from title if creating new
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  };

  const handleCategorySelect = (catName: string) => {
    const found = EVENT_CATEGORIES.find((c) => c.category === catName);
    if (found) {
      setCategory(found.category);
      setCategorySlug(found.slug);
    } else {
      setCategory(catName);
    }
  };

  // Image Upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Image file exceeds the 8MB size limit.");
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");
      formData.append("folder", "events");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload cover image.");
      }

      setCoverImage(data.url);
      setCoverImagePublicId(data.publicId || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!title.trim() || !slug.trim() || !description.trim() || !venue.trim() || !organizer.trim()) {
      setError("Please complete all required fields (Title, Slug, Description, Venue, Organizer).");
      return;
    }

    if (!startAt || !endAt) {
      setError("Please specify valid start and end dates and times.");
      return;
    }

    if (new Date(startAt) >= new Date(endAt)) {
      setError("Event end time must be after the start time.");
      return;
    }

    setSubmitting(true);

    try {
      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        description: description.trim(),
        category,
        categorySlug,
        coverImage: coverImage.trim() || null,
        coverImagePublicId: coverImagePublicId || null,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        timezone,
        venue: venue.trim(),
        organizer: organizer.trim(),
        capacity: capacity ? parseInt(capacity, 10) : null,
        audience: audience.trim() || null,
        tags: tagsArray,
        isFeatured,
        publicationStatus,
        suggestionId,
      };

      const url = isEditing && initialData?.id
        ? `/api/admin/events/${initialData.id}`
        : "/api/admin/events";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        if (resData.details) {
          setFieldErrors(resData.details);
        }
        throw new Error(resData.error || "Failed to save event.");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 bg-gray-50/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h2 id="event-modal-title" className="text-base font-bold text-gray-900">
                {isEditing ? "Edit Event Details" : "Create New Event"}
              </h2>
              <p className="text-xs text-gray-500">
                {isEditing
                  ? "Update schedules, venue details, and publication states."
                  : "Publish academic workshops, seminars, or student competitions."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-sm">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Title & Slug */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Robotics & Industrial Automation Workshop 2026"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#00FF00]/40 focus:border-[#00C800] text-sm text-gray-900"
              />
              {fieldErrors.title && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.title[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  placeholder="e.g. robotics-workshop-2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#00FF00]/40 focus:border-[#00C800] text-xs font-mono text-gray-800"
                />
                {fieldErrors.slug && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.slug[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#00FF00]/40 focus:border-[#00C800] text-sm text-gray-800 bg-white"
                >
                  {EVENT_CATEGORIES.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Date, Time & Venue */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Date, Time &amp; Location</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Start Date &amp; Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-mono text-gray-800 focus:ring-2 focus:ring-[#00FF00]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  End Date &amp; Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-mono text-gray-800 focus:ring-2 focus:ring-[#00FF00]/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Venue / Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Main Auditorium or Zoom Link"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:ring-2 focus:ring-[#00FF00]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Organizer / Host <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="e.g. Department of Biosystems & IEEE"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:ring-2 focus:ring-[#00FF00]/40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Descriptions */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Short Summary (Excerpt)
              </label>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="One-sentence teaser displayed on event listing cards..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#00FF00]/40 text-xs text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Full Description &amp; Event Scope <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe workshop goals, prerequisites, materials provided, schedule, and guest speakers..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#00FF00]/40 text-xs text-gray-800 leading-relaxed"
              />
              {fieldErrors.description && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.description[0]}</p>
              )}
            </div>
          </div>

          {/* Section 4: Cover Image */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-800">Cover Image</label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-2xl border border-gray-200 bg-gray-50">
              {coverImage ? (
                <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-300">
                  <Image
                    src={coverImage}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 h-20 rounded-xl bg-gray-200 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs shrink-0">
                  No Image
                </div>
              )}

              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shadow-2xs">
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{uploadingImage ? "Uploading..." : "Upload New Image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  {coverImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage("");
                        setCoverImagePublicId("");
                      }}
                      className="text-xs text-red-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Or paste direct image URL (https://...)"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Capacity, Audience & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Seat Capacity
              </label>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 60"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. 2nd & 3rd Year Students"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Python, ROS, Robotics"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-800"
              />
            </div>
          </div>

          {/* Section 6: Publication Status & Flags */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Publication Status
                </label>
                <div className="flex items-center gap-1.5">
                  {(["DRAFT", "PUBLISHED", "ARCHIVED"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setPublicationStatus(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        publicationStatus === st
                          ? st === "PUBLISHED"
                            ? "bg-[#00E500] text-black shadow-xs"
                            : st === "DRAFT"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-gray-800 text-white"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <input
                type="checkbox"
                id="isFeaturedEvent"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded-md accent-[#00FF00] cursor-pointer"
              />
              <label
                htmlFor="isFeaturedEvent"
                className="text-xs font-semibold text-gray-800 flex items-center gap-1 cursor-pointer select-none"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Feature Event on Top Banner</span>
              </label>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#171717] hover:bg-black text-white shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#00FF00]" />
                  <span>Saving Event...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#00FF00]" />
                  <span>{isEditing ? "Save Changes" : "Create Event"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
