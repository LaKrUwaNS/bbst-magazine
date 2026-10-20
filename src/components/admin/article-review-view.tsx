"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  History,
  ExternalLink,
  X,
  Edit,
} from "lucide-react";

export interface ArticleReviewData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  status: string;
  authorName: string | null;
  authorEmail: string | null;
  authorDept: string | null;
  writerId?: string | null;
  writer?: { id: string; name: string; slug: string; profileImageUrl?: string | null } | null;
  submissionRef: string | null;
  submissionSource: string | null;
  editorialFeedback: string | null;
  rejectionReason: string | null;
  editorialNotes: string | null;
  tags: string | null;
  isFeatured: boolean;
  submittedAt: string | Date | null;
  reviewedAt: string | Date | null;
  reviewedBy: string | null;
  publishedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  category: { id: string; name: string; slug: string } | null;
  revisions: Array<{
    id: string;
    title: string;
    excerpt: string | null;
    content: string | null;
    feedback: string | null;
    status: string;
    createdById: string | null;
    createdAt: string | Date;
  }>;
}

interface ArticleReviewViewProps {
  initialArticle: ArticleReviewData;
}

export function ArticleReviewView({ initialArticle }: ArticleReviewViewProps) {
  const router = useRouter();
  const [article, setArticle] = useState<ArticleReviewData>(initialArticle);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modal Dialogs for Consequential Actions
  const [activeModal, setActiveModal] = useState<
    "APPROVE" | "PUBLISH" | "REQUEST_REVISION" | "REJECT" | null
  >(null);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");

  // Revision snapshot preview modal
  const [selectedRevision, setSelectedRevision] = useState<
    ArticleReviewData["revisions"][0] | null
  >(null);

  const executeAction = async (action: string, feedback?: string, reason?: string) => {
    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`/api/admin/submissions/${article.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, feedback, reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to execute action.");
      }

      setArticle(data.article);
      setSuccessMessage(data.message || "Editorial action executed successfully.");
      setActiveModal(null);
      setFeedbackInput("");
      setRejectionReasonInput("");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed.";
      setErrorMessage(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "UNDER_REVIEW":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "REVISION_REQUESTED":
        return "bg-orange-50 text-orange-800 border-orange-200";
      case "APPROVED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "PUBLISHED":
        return "bg-green-100 text-green-900 border-green-300";
      case "REJECTED":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Return */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/submissions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Submission Queue</span>
        </Link>

        {article.status === "PUBLISHED" && (
          <Link
            href={`/articles/${article.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <span>View Live Article</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Review Card */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden">
        {/* Review Action Toolbar */}
        <div className="p-4 sm:p-6 bg-gray-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(
                article.status
              )}`}
            >
              {article.status.replace("_", " ")}
            </span>
            {article.submissionRef && (
              <span className="font-mono text-xs font-bold text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200">
                {article.submissionRef}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {article.status === "SUBMITTED" && (
              <button
                type="button"
                onClick={() => executeAction("MOVE_TO_REVIEW")}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
              >
                Mark Under Review
              </button>
            )}

            {article.status !== "APPROVED" && article.status !== "PUBLISHED" && (
              <button
                type="button"
                onClick={() => setActiveModal("APPROVE")}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
              >
                Approve
              </button>
            )}

            {article.status !== "PUBLISHED" ? (
              <button
                type="button"
                onClick={() => setActiveModal("PUBLISH")}
                disabled={actionLoading}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-xs transition-all cursor-pointer"
              >
                Publish to Live Site
              </button>
            ) : (
              <button
                type="button"
                onClick={() => executeAction("UNPUBLISH")}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
              >
                Unpublish (Move to Draft)
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveModal("REQUEST_REVISION")}
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 transition-colors cursor-pointer"
            >
              Request Revisions
            </button>

            {article.status !== "REJECTED" && (
              <button
                type="button"
                onClick={() => setActiveModal("REJECT")}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 transition-colors cursor-pointer"
              >
                Reject
              </button>
            )}

            <Link
              href={`/admin/articles/${article.id}/edit`}
              className="p-1.5 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
              title="Edit full article content"
            >
              <Edit className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Article Details & Editorial Notes Banner */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
            <div>
              <span className="text-gray-400 block font-medium">Original Writer</span>
              <span className="font-bold text-gray-900">{article.authorName || "Anonymous"}</span>
              {article.writer ? (
                <Link
                  href={`/writers/${article.writer.slug}`}
                  target="_blank"
                  className="text-emerald-700 hover:underline font-semibold block truncate"
                >
                  Linked Profile ({article.writer.name})
                </Link>
              ) : (
                <span className="text-gray-500 block truncate">{article.authorEmail || "Unlinked Contributor"}</span>
              )}
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Category</span>
              <span className="font-bold text-gray-900">{article.category?.name || "General"}</span>
              <span className="text-gray-500 block">{article.authorDept || "BBST Department"}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Submitted Date</span>
              <span className="font-bold text-gray-900">
                {article.submittedAt
                  ? new Date(article.submittedAt).toLocaleDateString()
                  : new Date(article.createdAt).toLocaleDateString()}
              </span>
              <span className="text-gray-500 block">{article.submissionSource || "Web Submission"}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Review Status</span>
              <span className="font-bold text-gray-900">
                {article.reviewedBy ? `By ${article.reviewedBy}` : "Pending Reviewer"}
              </span>
              <span className="text-gray-500 block">
                {article.reviewedAt ? new Date(article.reviewedAt).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>

          {/* Active Feedback Banner if in Revision */}
          {article.editorialFeedback && (
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs space-y-1">
              <span className="font-bold text-orange-900 uppercase tracking-wider block">
                Feedback Provided to Writer:
              </span>
              <p className="text-orange-950 whitespace-pre-wrap">{article.editorialFeedback}</p>
            </div>
          )}

          {/* Rejection Reason if Rejected */}
          {article.rejectionReason && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs space-y-1">
              <span className="font-bold text-red-900 uppercase tracking-wider block">
                Rejection Reason:
              </span>
              <p className="text-red-950 whitespace-pre-wrap">{article.rejectionReason}</p>
            </div>
          )}

          {/* Cover Image */}
          {article.coverImage && (
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Title & Excerpt */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="text-base text-gray-600 italic font-serif leading-relaxed border-l-4 border-emerald-400 pl-4">
                &ldquo;{article.excerpt}&rdquo;
              </p>
            )}
          </div>

          {/* Full Article Content */}
          <div className="pt-4 border-t border-gray-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-4">
              Article Manuscript Content
            </span>
            <div
              className="prose prose-sm sm:prose-base max-w-none text-[#171717] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content || "<p>No content entered.</p>" }}
            />
          </div>
        </div>
      </div>

      {/* Revision History Section (Workflow C) */}
      {article.revisions && article.revisions.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
            <History className="w-4 h-4 text-emerald-700" />
            <span>Revision History ({article.revisions.length} Snapshots Saved)</span>
          </div>

          <div className="space-y-3">
            {article.revisions.map((rev, idx) => (
              <div
                key={rev.id}
                className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      Revision #{article.revisions.length - idx}: &ldquo;{rev.title}&rdquo;
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                      {rev.status}
                    </span>
                  </div>
                  <span className="text-gray-400 block mt-0.5">
                    Saved by {rev.createdById || "Editor"} on {new Date(rev.createdAt).toLocaleString()}
                  </span>
                  {rev.feedback && (
                    <p className="text-orange-900 bg-orange-50/70 p-2 rounded-lg mt-1 border border-orange-100">
                      Feedback: {rev.feedback}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRevision(rev)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-xs font-semibold text-gray-800 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  View Snapshot
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONFIRMATION MODALS FOR EDITORIAL ACTIONS               */}
      {/* ======================================================== */}

      {/* Modal 1: Request Revisions */}
      {activeModal === "REQUEST_REVISION" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border border-orange-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span>Request Revisions from Writer</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600">
              Provide constructive editorial guidance. This feedback will be securely visible to the
              contributor via their tracking reference so they can submit a revised version.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Editorial Feedback Note *</label>
              <textarea
                rows={4}
                required
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="e.g. Please expand on your methodology in section 2, and add citations for the energy efficiency statistics."
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !feedbackInput.trim()}
                onClick={() => executeAction("REQUEST_REVISION", feedbackInput)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Submitting..." : "Send Revision Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Reject Submission */}
      {activeModal === "REJECT" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border border-red-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span>Reject Article Submission</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600">
              The article will be marked as REJECTED and kept private. It will not be deleted from
              the database.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Reason for Rejection (Optional)</label>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Content does not align with the themes for this edition."
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => executeAction("REJECT", undefined, rejectionReasonInput)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                {actionLoading ? "Processing..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Approve & Publish Confirmations */}
      {(activeModal === "APPROVE" || activeModal === "PUBLISH") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">
              {activeModal === "PUBLISH" ? "Publish Article Now?" : "Approve Article?"}
            </h3>
            <p className="text-xs text-gray-600">
              {activeModal === "PUBLISH"
                ? `This will publish "${article.title}" to the live website on /articles immediately.`
                : `This will mark "${article.title}" as APPROVED. It will remain private until explicitly published.`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => executeAction(activeModal)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-xs transition-colors cursor-pointer"
              >
                {actionLoading ? "Processing..." : `Confirm ${activeModal}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snapshot Preview Modal */}
      {selectedRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs font-bold text-gray-400">Archived Snapshot</span>
                <h3 className="text-base font-bold text-gray-900">{selectedRevision.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRevision(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {selectedRevision.feedback && (
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-950">
                  <span className="font-bold block">Editorial Feedback:</span>
                  {selectedRevision.feedback}
                </div>
              )}
              <div
                className="prose prose-sm max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: selectedRevision.content || "<p>No content.</p>" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
