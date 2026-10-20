"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink,
  Users,
  Eye,
  CheckCircle2,
  Clock,
  Archive,
  BookOpen,
  Sparkles,
  AlertCircle,
  X,
} from "lucide-react";

export interface WriterItem {
  id: string;
  name: string;
  slug: string;
  shortBio: string | null;
  profileImageUrl: string | null;
  department: string | null;
  academicYear: string | null;
  role: string | null;
  expertise: string | null;
  status: string;
  isFeatured: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count: {
    articles: number;
  };
}

export function WritersTable() {
  const [writers, setWriters] = useState<WriterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<WriterItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Preview modal state
  const [previewWriter, setPreviewWriter] = useState<WriterItem | null>(null);

  const loadWriters = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", page.toString());
      params.set("pageSize", "15");

      const res = await fetch(`/api/admin/writers?${params.toString()}`);
      const data = await res.json();
      if (data.writers) {
        setWriters(data.writers);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to load writers:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadWriters();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadWriters]);

  // Toggle Publish / Unpublish status quickly
  const handleToggleStatus = async (writer: WriterItem) => {
    const newStatus = writer.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/writers/${writer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadWriters();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // Safe delete or archive
  const handleDelete = async (force: boolean = false) => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(
        `/api/admin/writers/${deleteTarget.id}${force ? "?force=true" : ""}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || "Failed to delete writer profile.");
        return;
      }
      setDeleteTarget(null);
      loadWriters();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Deletion failed.";
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: CheckCircle2,
          label: "Published",
        };
      case "ARCHIVED":
        return {
          bg: "bg-gray-100 text-gray-700 border-gray-300",
          icon: Archive,
          label: "Archived",
        };
      default:
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          icon: Clock,
          label: "Draft",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
              Writer Profiles
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage student contributors, authors, researchers, and editorial
            staff across BBST Magazine.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadWriters}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/writers/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Writer</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-2xl bg-white border border-gray-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search writers by name, department, expertise, or title..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="DRAFT">Draft Profiles</option>
            <option value="ARCHIVED">Archived Profiles</option>
          </select>
        </div>
      </div>

      {/* Desktop Table & Mobile Cards */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading && writers.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading writer profiles...</span>
          </div>
        ) : writers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              No writers found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search query or status filter."
                : "Create your first writer profile to associate with magazine articles."}
            </p>
            <Link
              href="/admin/writers/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#00E500] text-black hover:bg-[#00D000] shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Writer Profile</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="py-3 px-6">Writer</th>
                    <th className="py-3 px-4">Affiliation / Role</th>
                    <th className="py-3 px-4">Expertise</th>
                    <th className="py-3 px-4 text-center">
                      Published Articles
                    </th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {writers.map((writer) => {
                    const badge = getStatusBadge(writer.status);
                    const BadgeIcon = badge.icon;
                    const dateStr = new Date(
                      writer.updatedAt,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <tr
                        key={writer.id}
                        className="hover:bg-gray-50/60 transition-colors group"
                      >
                        {/* Photo & Name */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                              <Image
                                src={
                                  writer.profileImageUrl ||
                                  "/images/avatar1.jpg"
                                }
                                alt={writer.name}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Link
                                  href={`/admin/writers/${writer.id}/edit`}
                                  className="font-bold text-[#171717] hover:text-emerald-700 transition-colors truncate"
                                >
                                  {writer.name}
                                </Link>
                                {writer.isFeatured && (
                                  <span title="Featured Writer">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-400 font-mono block">
                                /writers/{writer.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Affiliation & Role */}
                        <td className="py-3.5 px-4 text-xs">
                          <span className="font-semibold text-gray-900 block truncate max-w-45">
                            {writer.role || "Contributor"}
                          </span>
                          <span className="text-gray-400 block truncate max-w-45">
                            {writer.department || "BBST Department"}
                          </span>
                        </td>

                        {/* Expertise */}
                        <td className="py-3.5 px-4 text-xs">
                          {writer.expertise ? (
                            <span className="text-gray-600 truncate block max-w-37.5">
                              {writer.expertise}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">
                              None specified
                            </span>
                          )}
                        </td>

                        {/* Published Articles Count */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                            <BookOpen className="w-3 h-3 text-emerald-600" />
                            <span>{writer._count.articles}</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(writer)}
                            title="Click to toggle status"
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${badge.bg}`}
                          >
                            <BadgeIcon className="w-3 h-3" />
                            <span>{badge.label}</span>
                          </button>
                        </td>

                        {/* Last Updated */}
                        <td className="py-3.5 px-4 text-xs text-gray-400">
                          {dateStr}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview button */}
                            <button
                              type="button"
                              onClick={() => setPreviewWriter(writer)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                              title="Quick preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Public profile link */}
                            {writer.status === "PUBLISHED" && (
                              <Link
                                href={`/writers/${writer.slug}`}
                                target="_blank"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                title="View public profile"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            )}

                            {/* Edit link */}
                            <Link
                              href={`/admin/writers/${writer.id}/edit`}
                              className="p-1.5 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                              title="Edit profile"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(writer);
                                setDeleteError("");
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete or Archive profile"
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

            {/* Mobile Card View (Visible only on < lg) */}
            <div className="lg:hidden divide-y divide-gray-100">
              {writers.map((writer) => {
                const badge = getStatusBadge(writer.status);
                const BadgeIcon = badge.icon;

                return (
                  <div key={writer.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                          <Image
                            src={
                              writer.profileImageUrl || "/images/avatar1.jpg"
                            }
                            alt={writer.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/admin/writers/${writer.id}/edit`}
                              className="font-bold text-sm text-gray-900 hover:text-emerald-700"
                            >
                              {writer.name}
                            </Link>
                            {writer.isFeatured && (
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            )}
                          </div>
                          <span className="text-xs text-gray-500 block">
                            {writer.role || "Contributor"} •{" "}
                            {writer.department || "BBST"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{writer._count.articles} Published Articles</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {writer.status === "PUBLISHED" && (
                          <Link
                            href={`/writers/${writer.slug}`}
                            target="_blank"
                            className="p-1 rounded-md text-gray-400 hover:text-black"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/writers/${writer.id}/edit`}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-xs">
                <span className="text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete / Archive Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span>Delete Writer Profile</span>
              </h3>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to delete the profile for{" "}
              <strong className="text-gray-900">
                &ldquo;{deleteTarget.name}&rdquo;
              </strong>
              ?
            </p>

            {deleteTarget._count.articles > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <span className="font-bold block">
                  Notice: This writer has {deleteTarget._count.articles}{" "}
                  associated article(s).
                </span>
                <p>
                  Deleting will remove their public profile, but published
                  articles will preserve their recorded attribution name without
                  losing content. To preserve profile data, you can archive
                  instead.
                </p>
              </div>
            )}

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-semibold">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>

              {deleteTarget._count.articles > 0 && (
                <button
                  type="button"
                  disabled={deleting}
                  onClick={async () => {
                    await fetch(`/api/admin/writers/${deleteTarget.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "ARCHIVED" }),
                    });
                    setDeleteTarget(null);
                    loadWriters();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer"
                >
                  Archive Instead
                </button>
              )}

              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDelete(deleteTarget._count.articles > 0)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Profile Preview Modal */}
      {previewWriter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-gray-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Writer Profile Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewWriter(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                <Image
                  src={previewWriter.profileImageUrl || "/images/avatar1.jpg"}
                  alt={previewWriter.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {previewWriter.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {previewWriter.role || "Contributor"} •{" "}
                  {previewWriter.department || "BBST"}
                </p>
                <span className="text-[11px] font-mono text-gray-400 block mt-0.5">
                  /writers/{previewWriter.slug}
                </span>
              </div>
            </div>

            {previewWriter.shortBio && (
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                {previewWriter.shortBio}
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <span className="font-semibold text-gray-700">
                {previewWriter._count.articles} published article(s)
              </span>
              <Link
                href={`/admin/writers/${previewWriter.id}/edit`}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black transition-colors"
              >
                Open Full Editor
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
