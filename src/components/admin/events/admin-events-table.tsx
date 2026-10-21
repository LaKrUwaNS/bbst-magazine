"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  Inbox,
  ExternalLink,
  MapPin,
  Building,
  Sparkles,
  Loader2,
  RefreshCw,
  ChevronRight,
  XCircle,
} from "lucide-react";

import { EventModalDialog, EventFormData } from "./event-modal-dialog";
import { EventPreviewModal } from "./event-preview-modal";
import { EventDeleteDialog } from "./event-delete-dialog";
import {
  SuggestionReviewModal,
  EventSuggestionItem,
} from "./suggestion-review-modal";

export interface AdminEventItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string;
  category: string;
  categorySlug: string;
  coverImage: string | null;
  coverImagePublicId: string | null;
  startAt: string | Date;
  endAt: string | Date;
  timezone: string;
  venue: string;
  organizer: string;
  participantCount: string | null;
  capacity: number | null;
  audience: string | null;
  agenda?: unknown;
  tags?: unknown;
  isFeatured: boolean;
  publicationStatus: string; // DRAFT, PUBLISHED, ARCHIVED
  suggestionId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  suggestion?: {
    id: string;
    organizerName: string | null;
    organizerEmail: string;
    status: string;
  } | null;
}

export interface EventStats {
  total: number;
  published: number;
  drafts: number;
  pendingSuggestions: number;
}

interface AdminEventsTableProps {
  initialEvents: AdminEventItem[];
  initialSuggestions: EventSuggestionItem[];
  initialStats: EventStats;
}

const CATEGORY_FILTER_OPTIONS = [
  { label: "All Categories", value: "all" },
  { label: "Seminars & Workshops", value: "workshops" },
  { label: "Student Activities", value: "student-activities" },
  { label: "Competitions", value: "competitions" },
  { label: "Community & Networking", value: "community" },
];

export function AdminEventsTable({
  initialEvents,
  initialSuggestions,
  initialStats,
}: AdminEventsTableProps) {
  // Tab State: "events" | "suggestions"
  const [activeTab, setActiveTab] = useState<"events" | "suggestions">(
    "events",
  );

  // Data states
  const [events, setEvents] = useState<AdminEventItem[]>(initialEvents);
  const [suggestions, setSuggestions] =
    useState<EventSuggestionItem[]>(initialSuggestions);
  const [stats, setStats] = useState<EventStats>(initialStats);
  const [loading, setLoading] = useState(false);

  // Filter States - Events Tab
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Filter States - Suggestions Tab
  const [suggestionStatusFilter, setSuggestionStatusFilter] = useState("all");
  const [suggestionSearchQuery, setSuggestionSearchQuery] = useState("");

  // Modals & Dialogs State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventFormData | null>(null);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewingEvent, setPreviewingEvent] = useState<EventFormData | null>(
    null,
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<AdminEventItem | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingSuggestion, setReviewingSuggestion] =
    useState<EventSuggestionItem | null>(null);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Refresh events & stats from server
  const refreshEventsData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);

      const res = await fetch(`/api/admin/events?${params.toString()}`);
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to refresh events:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, categoryFilter]);

  // Refresh suggestions from server
  const refreshSuggestionsData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (suggestionSearchQuery) params.set("q", suggestionSearchQuery);
      if (suggestionStatusFilter !== "all")
        params.set("status", suggestionStatusFilter);

      const res = await fetch(
        `/api/admin/events/suggestions?${params.toString()}`,
      );
      const data = await res.json();
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
      if (data.counts) {
        setStats((prev) => ({
          ...prev,
          pendingSuggestions: data.counts.pending,
        }));
      }
    } catch (err) {
      console.error("Failed to refresh suggestions:", err);
    }
  }, [suggestionSearchQuery, suggestionStatusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "events") {
        refreshEventsData();
      } else {
        refreshSuggestionsData();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [activeTab, refreshEventsData, refreshSuggestionsData]);

  // Quick Toggle Publish / Unpublish status
  const handleToggleStatus = async (event: AdminEventItem) => {
    const newStatus =
      event.publicationStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setActionLoadingId(event.id);

    try {
      const res = await fetch(`/api/admin/events/${event.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update publication status.");
      }
      refreshEventsData();
    } catch (err) {
      console.error("Error toggling status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Preview Modal
  const handleOpenPreview = (item: AdminEventItem) => {
    setPreviewingEvent({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      description: item.description,
      category: item.category,
      categorySlug: item.categorySlug,
      coverImage: item.coverImage,
      coverImagePublicId: item.coverImagePublicId,
      startAt: new Date(item.startAt).toISOString(),
      endAt: new Date(item.endAt).toISOString(),
      timezone: item.timezone,
      venue: item.venue,
      organizer: item.organizer,
      participantCount: item.participantCount,
      capacity: item.capacity,
      audience: item.audience,
      tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
      isFeatured: item.isFeatured,
      publicationStatus: item.publicationStatus as
        | "DRAFT"
        | "PUBLISHED"
        | "ARCHIVED",
    });
    setPreviewModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: AdminEventItem) => {
    setEditingEvent({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      description: item.description,
      category: item.category,
      categorySlug: item.categorySlug,
      coverImage: item.coverImage,
      coverImagePublicId: item.coverImagePublicId,
      startAt: new Date(item.startAt).toISOString(),
      endAt: new Date(item.endAt).toISOString(),
      timezone: item.timezone,
      venue: item.venue,
      organizer: item.organizer,
      participantCount: item.participantCount,
      capacity: item.capacity,
      audience: item.audience,
      tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
      isFeatured: item.isFeatured,
      publicationStatus: item.publicationStatus as
        | "DRAFT"
        | "PUBLISHED"
        | "ARCHIVED",
      suggestionId: item.suggestionId,
    });
    setCreateModalOpen(true);
  };

  // Delete Action confirmation
  const handleOpenDelete = (item: AdminEventItem) => {
    setEventToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/events/${eventToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete event.");
      }
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      refreshEventsData();
    } catch (err) {
      console.error("Error deleting event:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Suggestion review & conversion to event
  const handleOpenSuggestionReview = (sug: EventSuggestionItem) => {
    setReviewingSuggestion(sug);
    setReviewModalOpen(true);
  };

  const handleApproveAndPrefillEvent = (prefilled: EventFormData) => {
    setEditingEvent(prefilled);
    setCreateModalOpen(true);
    setActiveTab("events");
  };

  // Filtered lists
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.excerpt &&
        e.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      e.publicationStatus.toLowerCase() === statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === "all" ||
      e.categorySlug.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredSuggestions = suggestions.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(suggestionSearchQuery.toLowerCase()) ||
      s.description
        .toLowerCase()
        .includes(suggestionSearchQuery.toLowerCase()) ||
      (s.organizerName &&
        s.organizerName
          .toLowerCase()
          .includes(suggestionSearchQuery.toLowerCase())) ||
      s.organizerEmail
        .toLowerCase()
        .includes(suggestionSearchQuery.toLowerCase());

    const matchesStatus =
      suggestionStatusFilter === "all" ||
      s.status.toLowerCase() === suggestionStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
              Events &amp; Workshops
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#00FF00]/20 text-emerald-900 border border-[#00FF00]/40">
              Live Hub
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Publish academic symposiums, manage schedules, and review public
            proposals from university organizers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/events"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            <span className="hidden sm:inline">View Public Calendar</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setEditingEvent(null);
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#171717] hover:bg-black text-white shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#00FF00]" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Top Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Events */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Events
            </span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            {stats.total}
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">
            In database
          </span>
        </div>

        {/* Published */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Published
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            {stats.published}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            Live on website
          </span>
        </div>

        {/* Drafts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Drafts
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            {stats.drafts}
          </p>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
            Unpublished / Review
          </span>
        </div>

        {/* Pending Suggestions (Clickable to switch tab) */}
        <div
          onClick={() => setActiveTab("suggestions")}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs cursor-pointer hover:border-blue-400 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider group-hover:underline">
              Suggestions
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            {stats.pendingSuggestions}
          </p>
          <span className="text-[11px] text-blue-700 font-semibold mt-1 flex items-center justify-between">
            <span>Pending Proposals</span>
            <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
          </span>
        </div>
      </div>

      {/* Primary Section Tabs: Events Table vs Public Proposals Queue */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-0">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "events"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>All Events ({events.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("suggestions")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "suggestions"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Public Suggestions ({suggestions.length})</span>
            {stats.pendingSuggestions > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white">
                {stats.pendingSuggestions}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (activeTab === "events") refreshEventsData();
            else refreshSuggestionsData();
          }}
          disabled={loading}
          title="Refresh table"
          className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? "animate-spin text-black" : ""}`}
          />
        </button>
      </div>

      {/* TAB 1: ALL EVENTS MANAGEMENT TABLE */}
      {activeTab === "events" && (
        <div className="space-y-4">
          {/* Search & Filters Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by title, venue, organizer..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#00FF00]/40 text-gray-800"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-[#00FF00]/40 cursor-pointer"
              >
                {CATEGORY_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-[#00FF00]/40 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Events Table Container */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-800">
                  No events found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {searchQuery ||
                  statusFilter !== "all" ||
                  categoryFilter !== "all"
                    ? "Try adjusting your search filters to find what you are looking for."
                    : "Get started by creating your first university workshop or symposium."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingEvent(null);
                    setCreateModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#171717] hover:bg-black text-white transition-colors cursor-pointer mt-2"
                >
                  <Plus className="w-3.5 h-3.5 text-[#00FF00]" />
                  <span>Create First Event</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4 sm:px-6">Event Details</th>
                      <th className="py-3.5 px-4 hidden md:table-cell">
                        Date &amp; Schedule
                      </th>
                      <th className="py-3.5 px-4 hidden lg:table-cell">
                        Location &amp; Host
                      </th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {filteredEvents.map((evt) => {
                      const startDateStr = new Date(
                        evt.startAt,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                      const startTimeStr = new Date(
                        evt.startAt,
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      const isPublished = evt.publicationStatus === "PUBLISHED";
                      const isDraft = evt.publicationStatus === "DRAFT";

                      return (
                        <tr
                          key={evt.id}
                          className="hover:bg-gray-50/80 transition-colors"
                        >
                          {/* Event Details */}
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                {evt.coverImage ? (
                                  <Image
                                    src={evt.coverImage}
                                    alt={evt.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700">
                                    <Calendar className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                                    {evt.category}
                                  </span>
                                  {evt.isFeatured && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00FF00]/20 text-emerald-900 border border-[#00FF00]/30 flex items-center gap-1">
                                      <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                                      Featured
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-xs sm:max-w-sm mt-0.5">
                                  {evt.title}
                                </h4>
                                <p className="text-[11px] text-gray-400 font-mono truncate">
                                  /{evt.slug}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Date & Schedule */}
                          <td className="py-3.5 px-4 hidden md:table-cell text-xs">
                            <div className="space-y-0.5">
                              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{startDateStr}</span>
                              </div>
                              <p className="text-gray-500 font-mono text-[11px]">
                                {startTimeStr} ({evt.timezone})
                              </p>
                            </div>
                          </td>

                          {/* Location & Host */}
                          <td className="py-3.5 px-4 hidden lg:table-cell text-xs">
                            <div className="space-y-0.5">
                              <p className="font-medium text-gray-800 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                <span className="truncate max-w-45">
                                  {evt.venue}
                                </span>
                              </p>
                              <p className="text-gray-500 text-[11px] flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-gray-400" />
                                <span className="truncate max-w-45">
                                  {evt.organizer}
                                </span>
                              </p>
                            </div>
                          </td>

                          {/* Publication Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                isPublished
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                  : isDraft
                                    ? "bg-amber-100 text-amber-900 border border-amber-200"
                                    : "bg-gray-100 text-gray-800 border border-gray-200"
                              }`}
                            >
                              {isPublished && (
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              )}
                              {isDraft && (
                                <Clock className="w-3 h-3 text-amber-700" />
                              )}
                              <span>{evt.publicationStatus}</span>
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Preview */}
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(evt)}
                                title="Preview event"
                                className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(evt)}
                                title="Edit event details"
                                className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Toggle Publish / Unpublish */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(evt)}
                                disabled={actionLoadingId === evt.id}
                                title={
                                  isPublished
                                    ? "Unpublish to Draft"
                                    : "Publish to Live Site"
                                }
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isPublished
                                    ? "text-emerald-700 hover:bg-emerald-50"
                                    : "text-amber-700 hover:bg-amber-50"
                                }`}
                              >
                                {actionLoadingId === evt.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isPublished ? (
                                  <Archive className="w-4 h-4" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4 text-[#00C800]" />
                                )}
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleOpenDelete(evt)}
                                title="Delete event"
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PUBLIC EVENT SUGGESTIONS QUEUE */}
      {activeTab === "suggestions" && (
        <div className="space-y-4">
          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={suggestionSearchQuery}
                onChange={(e) => setSuggestionSearchQuery(e.target.value)}
                placeholder="Search suggestions by title, submitter name or email..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#00FF00]/40 text-gray-800"
              />
            </div>

            <select
              value={suggestionStatusFilter}
              onChange={(e) => setSuggestionStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-[#00FF00]/40 cursor-pointer"
            >
              <option value="all">All Proposals</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Suggestions Table */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
            {filteredSuggestions.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-800">
                  No event proposals found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  When students or university societies submit event proposals
                  via the public Events page, they will appear here for
                  editorial review.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4 sm:px-6">Proposal Title</th>
                      <th className="py-3.5 px-4 hidden md:table-cell">
                        Submitted By
                      </th>
                      <th className="py-3.5 px-4 hidden lg:table-cell">
                        Suggested Schedule
                      </th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">
                        Review Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {filteredSuggestions.map((sug) => {
                      const submittedAtStr = new Date(
                        sug.createdAt,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });

                      const isPending = sug.status === "PENDING";
                      const isApproved = sug.status === "APPROVED";
                      const isRejected = sug.status === "REJECTED";

                      return (
                        <tr
                          key={sug.id}
                          className="hover:bg-gray-50/80 transition-colors"
                        >
                          {/* Title & Category */}
                          <td className="py-3.5 px-4 sm:px-6">
                            <div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                                {sug.category}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-gray-900 mt-1 max-w-sm">
                                {sug.title}
                              </h4>
                              <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                {sug.description}
                              </p>
                            </div>
                          </td>

                          {/* Submitter */}
                          <td className="py-3.5 px-4 hidden md:table-cell text-xs">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {sug.organizerName || "Anonymous"}
                              </p>
                              <a
                                href={`mailto:${sug.organizerEmail}`}
                                className="text-gray-500 hover:text-black font-mono text-[11px] block"
                              >
                                {sug.organizerEmail}
                              </a>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Submitted {submittedAtStr}
                              </p>
                            </div>
                          </td>

                          {/* Suggested Schedule */}
                          <td className="py-3.5 px-4 hidden lg:table-cell text-xs">
                            <div className="space-y-0.5">
                              <p className="font-medium text-gray-800">
                                {sug.suggestedDate || "Flexible / TBD"}
                              </p>
                              <p className="text-gray-400 text-[11px]">
                                {sug.venue || "Campus venue"}
                              </p>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                isPending
                                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                                  : isApproved
                                    ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                    : "bg-red-100 text-red-900 border border-red-200"
                              }`}
                            >
                              {isPending && (
                                <Clock className="w-3 h-3 text-amber-700" />
                              )}
                              {isApproved && (
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              )}
                              {isRejected && (
                                <XCircle className="w-3 h-3 text-red-700" />
                              )}
                              <span>{sug.status}</span>
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenSuggestionReview(sug)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-black hover:text-white text-gray-800 transition-colors cursor-pointer"
                            >
                              <span>Review Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE & EDIT EVENT DIALOG */}
      <EventModalDialog
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingEvent(null);
        }}
        onSuccess={() => {
          refreshEventsData();
          refreshSuggestionsData();
        }}
        initialData={editingEvent}
      />

      {/* EVENT PREVIEW MODAL */}
      <EventPreviewModal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setPreviewingEvent(null);
        }}
        event={previewingEvent}
        onPublishNow={async (id) => {
          await fetch(`/api/admin/events/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "PUBLISHED" }),
          });
          refreshEventsData();
        }}
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <EventDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setEventToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        eventTitle={eventToDelete?.title || "this event"}
        deleting={deleting}
      />

      {/* SUGGESTION REVIEW MODAL */}
      <SuggestionReviewModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setReviewingSuggestion(null);
        }}
        suggestion={reviewingSuggestion}
        onApproveAndCreateEvent={handleApproveAndPrefillEvent}
        onActionComplete={() => {
          refreshSuggestionsData();
          refreshEventsData();
        }}
      />
    </div>
  );
}
