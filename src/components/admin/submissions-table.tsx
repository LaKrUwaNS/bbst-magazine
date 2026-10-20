"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  RefreshCw,
  Eye,
  Inbox,
} from "lucide-react";

export interface SubmissionItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  authorName: string | null;
  authorEmail: string | null;
  authorDept: string | null;
  coverImage: string | null;
  status: string;
  submissionRef: string | null;
  submissionSource: string | null;
  submittedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  category: { id: string; name: string; slug: string } | null;
  revisions: Array<{ id: string; createdAt: string; status: string }>;
}

export function SubmissionsTable() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL_QUEUE");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);

      const res = await fetch(`/api/admin/submissions?${params.toString()}`);
      const data = await res.json();
      if (data.submissions) {
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, categoryFilter]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/admin/categories");
        const json = await res.json();
        if (json.categories) setCategories(json.categories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSubmissions();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadSubmissions]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: Inbox,
          label: "New Submission",
        };
      case "UNDER_REVIEW":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
          label: "Under Review",
        };
      case "REVISION_REQUESTED":
        return {
          bg: "bg-orange-50 text-orange-700 border-orange-200",
          icon: AlertCircle,
          label: "Revision Requested",
        };
      case "APPROVED":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
          label: "Approved",
        };
      case "PUBLISHED":
        return {
          bg: "bg-green-100 text-green-800 border-green-300",
          icon: CheckCircle2,
          label: "Published",
        };
      case "REJECTED":
        return {
          bg: "bg-red-50 text-red-700 border-red-200",
          icon: AlertCircle,
          label: "Rejected",
        };
      default:
        return {
          bg: "bg-gray-100 text-gray-700 border-gray-200",
          icon: FileText,
          label: status,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            Editorial Submission Queue
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Review writer submissions, evaluate revisions, provide editorial feedback, and approve articles for publication.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSubmissions}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 p-3 rounded-2xl bg-white border border-gray-200 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by article title, author, email, or reference code..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL_QUEUE">Active Review Queue (All Pending)</option>
            <option value="SUBMITTED">New Submissions</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="REVISION_REQUESTED">Revision Requested</option>
            <option value="APPROVED">Approved (Ready to Publish)</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
            <option value="ALL">All Statuses</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions List / Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading && submissions.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading submissions from database...</span>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No submissions found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              There are currently no articles matching the selected queue filter. New public
              submissions will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3 px-4 sm:px-6">Article & Cover</th>
                  <th className="py-3 px-4">Author Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((item) => {
                  const badge = getStatusBadge(item.status);
                  const BadgeIcon = badge.icon;
                  const dateStr = item.submittedAt
                    ? new Date(item.submittedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : new Date(item.createdAt).toLocaleDateString();

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* Title & Cover */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            {item.coverImage ? (
                              <Image
                                src={item.coverImage}
                                alt={item.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-0.5 max-w-xs sm:max-w-md">
                            <Link
                              href={`/admin/submissions/${item.id}`}
                              className="font-bold text-[#171717] hover:text-emerald-700 transition-colors line-clamp-1"
                            >
                              {item.title}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {item.submissionRef && (
                                <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                                  {item.submissionRef}
                                </span>
                              )}
                              {item.revisions && item.revisions.length > 0 && (
                                <span className="text-[10px] text-gray-500 font-semibold">
                                  {item.revisions.length} revision(s)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-semibold text-gray-900 block">
                          {item.authorName || "Anonymous"}
                        </span>
                        <span className="text-gray-400 block truncate max-w-[140px]">
                          {item.authorEmail || item.authorDept || "Contributor"}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-gray-700">
                        {item.category?.name || "General"}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-gray-500">{dateStr}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <Link
                          href={`/admin/submissions/${item.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#171717] hover:bg-black text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </Link>
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
  );
}
