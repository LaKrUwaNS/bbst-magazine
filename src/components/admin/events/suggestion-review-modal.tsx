"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  MapPin,
  Mail,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { EventFormData } from "./event-modal-dialog";

export interface EventSuggestionItem {
  id: string;
  title: string;
  category: string;
  suggestedDate: string | null;
  venue: string | null;
  description: string;
  organizerName: string | null;
  organizerEmail: string;
  status: string; // PENDING, APPROVED, REJECTED
  rejectionReason: string | null;
  createdAt: string | Date;
  event?: {
    id: string;
    title: string;
    slug: string;
    publicationStatus: string;
  } | null;
}

interface SuggestionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: EventSuggestionItem | null;
  onApproveAndCreateEvent: (prefilled: EventFormData) => void;
  onActionComplete: () => void;
}

export function SuggestionReviewModal({
  isOpen,
  onClose,
  suggestion,
  onApproveAndCreateEvent,
  onActionComplete,
}: SuggestionReviewModalProps) {
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !suggestion) return null;

  const submittedAtFormatted = new Date(suggestion.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const handleQuickApprove = async () => {
    setLoadingAction(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/events/suggestions/${suggestion.id}/action`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "APPROVE", publishImmediately: false }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to approve suggestion.");
      }
      onActionComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error approving suggestion.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEditAndApprove = () => {
    // Generate prefilled event data for EventModalDialog
    const baseSlug = suggestion.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let startAtDate = new Date();
    if (suggestion.suggestedDate && !isNaN(Date.parse(suggestion.suggestedDate))) {
      startAtDate = new Date(suggestion.suggestedDate);
    } else {
      startAtDate.setDate(startAtDate.getDate() + 14);
      startAtDate.setHours(10, 0, 0, 0);
    }

    const endAtDate = new Date(startAtDate);
    endAtDate.setHours(endAtDate.getHours() + 3);

    const categorySlug = suggestion.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const prefilled: EventFormData = {
      title: suggestion.title,
      slug: baseSlug || `event-${Date.now()}`,
      excerpt: suggestion.description.slice(0, 150),
      description: suggestion.description,
      category: suggestion.category,
      categorySlug: categorySlug || "workshops",
      startAt: startAtDate.toISOString(),
      endAt: endAtDate.toISOString(),
      timezone: "Asia/Colombo",
      venue: suggestion.venue || "Faculty of Technological Studies, UWU",
      organizer: suggestion.organizerName || "BBST Student Community",
      capacity: 60,
      audience: "Undergraduates & General Academic Community",
      tags: [suggestion.category.toLowerCase(), "campus"],
      isFeatured: false,
      publicationStatus: "DRAFT",
      suggestionId: suggestion.id,
    };

    onApproveAndCreateEvent(prefilled);
    onClose();
  };

  const handleRejectConfirm = async () => {
    setLoadingAction(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/events/suggestions/${suggestion.id}/action`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "REJECT",
            rejectionReason: rejectionReason.trim() || undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reject suggestion.");
      }
      onActionComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error rejecting suggestion.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="suggestion-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 bg-gray-50/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <h2 id="suggestion-modal-title" className="text-base font-bold text-gray-900">
                Public Event Proposal
              </h2>
              <p className="text-xs text-gray-500">Submitted on {submittedAtFormatted}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1 text-sm">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
            <span className="text-xs font-semibold text-gray-600">Review Status:</span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                suggestion.status === "PENDING"
                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                  : suggestion.status === "APPROVED"
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                  : "bg-red-100 text-red-900 border border-red-200"
              }`}
            >
              {suggestion.status === "PENDING" && <Clock className="w-3.5 h-3.5" />}
              {suggestion.status === "APPROVED" && <CheckCircle2 className="w-3.5 h-3.5" />}
              {suggestion.status === "REJECTED" && <XCircle className="w-3.5 h-3.5" />}
              <span>{suggestion.status}</span>
            </span>
          </div>

          {/* Proposal Title */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 leading-snug">
              {suggestion.title}
            </h3>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-gray-100 text-gray-800">
              {suggestion.category}
            </span>
          </div>

          {/* Submitter & Venue Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200/80 text-xs">
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <div>
                <span className="text-gray-500 block text-[10px]">Submitted By:</span>
                <span className="font-semibold">{suggestion.organizerName || "Not provided"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <div>
                <span className="text-gray-500 block text-[10px]">Contact Email:</span>
                <a
                  href={`mailto:${suggestion.organizerEmail}`}
                  className="font-semibold text-emerald-800 hover:underline"
                >
                  {suggestion.organizerEmail}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <div>
                <span className="text-gray-500 block text-[10px]">Suggested Date:</span>
                <span className="font-semibold">{suggestion.suggestedDate || "Flexible / TBD"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <div>
                <span className="text-gray-500 block text-[10px]">Proposed Venue:</span>
                <span className="font-semibold">{suggestion.venue || "Campus Facilities"}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Proposed Description &amp; Objectives
            </h4>
            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 text-xs text-gray-800 leading-relaxed whitespace-pre-line">
              {suggestion.description}
            </div>
          </div>

          {/* If already Approved, display link to created Event */}
          {suggestion.status === "APPROVED" && suggestion.event && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Converted to event: <strong>{suggestion.event.title}</strong>
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 uppercase">
                {suggestion.event.publicationStatus}
              </span>
            </div>
          )}

          {/* If already Rejected, display rejection reason */}
          {suggestion.status === "REJECTED" && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-red-600" />
                Rejection Reason:
              </span>
              <p className="pl-5 text-gray-700">
                {suggestion.rejectionReason || "No specific feedback was recorded."}
              </p>
            </div>
          )}

          {/* Reject Reason Form (when user clicks Reject) */}
          {rejectMode && suggestion.status === "PENDING" && (
            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 space-y-3">
              <label className="block text-xs font-bold text-red-900">
                Reason for Rejection (Optional Note)
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this proposal is declined (e.g. date collision, scope outside BBST charter)..."
                className="w-full p-2.5 rounded-xl border border-red-200 bg-white text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-red-400"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectMode(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectConfirm}
                  disabled={loadingAction}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer disabled:opacity-50"
                >
                  {loadingAction ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Close
          </button>

          {suggestion.status === "PENDING" && !rejectMode && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setRejectMode(true)}
                disabled={loadingAction}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
              >
                Reject Proposal
              </button>

              <button
                type="button"
                onClick={handleEditAndApprove}
                disabled={loadingAction}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold text-gray-800 bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Edit &amp; Publish
              </button>

              <button
                type="button"
                onClick={handleQuickApprove}
                disabled={loadingAction}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {loadingAction ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Approve Suggestion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
