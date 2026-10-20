"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle,
  Clock,
  Archive,
  AlertTriangle,
  Plus,
  Loader2,
  FileText,
} from "lucide-react";

import { MagazineModalDialog, MagazineFormData } from "./magazine-modal-dialog";

export interface AdminMagazine {
  id: string;
  title: string;
  slug: string;
  edition?: string | null;
  description: string | null;
  coverImage: string | null;
  coverImagePublicId?: string | null;
  pdfAsset: string | null;
  pdfAssetPublicId?: string | null;
  publicationDate: string | Date | null;
  publicationYear?: number | null;
  isFeatured?: boolean;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface AdminMagazineTableProps {
  initialMagazines: AdminMagazine[];
  showFilters?: boolean;
  title?: string;
  subtitle?: string;
}

export function AdminMagazineTable({
  initialMagazines,
  showFilters = true,
  title = "Magazine Publications",
  subtitle = "Manage existing issues, update metadata, replace files, and control publishing status.",
}: AdminMagazineTableProps) {
  const router = useRouter();
  const [magazines, setMagazines] = useState<AdminMagazine[]>(initialMagazines);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Popup Modal Dialog State for Add & Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMagazine, setEditingMagazine] = useState<MagazineFormData | null>(null);

  // Deletion Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<AdminMagazine | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Refresh magazines from API
  const refreshMagazines = async () => {
    try {
      const res = await fetch("/api/admin/magazines");
      const data = await res.json();
      if (data.magazines) {
        setMagazines(data.magazines);
      }
    } catch (err) {
      console.error("Failed to refresh magazines:", err);
    }
    router.refresh();
  };

  // Filtered magazines
  const filtered = magazines.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle Quick Toggle Status
  const handleToggleStatus = async (magazine: AdminMagazine) => {
    const nextStatus = magazine.status === "published" ? "draft" : "published";
    setActionLoadingId(magazine.id);

    try {
      const res = await fetch(`/api/admin/magazines/${magazine.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update status.");
        setActionLoadingId(null);
        return;
      }

      setMagazines((prev) =>
        prev.map((item) =>
          item.id === magazine.id ? { ...item, status: nextStatus, updatedAt: new Date() } : item
        )
      );
      router.refresh();
    } catch (err) {
      console.error("[Table] Status toggle error:", err);
      alert("Network error occurred while updating status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Confirmed Deletion
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/magazines/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete magazine.");
        setDeleting(false);
        return;
      }

      setMagazines((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error("[Table] Delete error:", err);
      alert("Network error occurred while deleting magazine.");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-[#00C800]" />
            <span>Published</span>
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Draft</span>
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <Archive className="w-3 h-3 text-gray-500" />
            <span>Archived</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingMagazine(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-xs transition-all hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Magazine</span>
        </button>
      </div>

      {/* Filter / Search Bar (if enabled) */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, or slug..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#00C800] focus:ring-2 focus:ring-[#00FF00]/20 outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl shrink-0 overflow-x-auto">
            {["all", "published", "draft", "archived"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  statusFilter === st
                    ? "bg-white text-[#171717] shadow-2xs font-bold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-2xs">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Publication</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 hidden md:table-cell">Publish Date</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Last Updated</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => {
                  const isLoading = actionLoadingId === item.id;
                  const formattedDate = item.publicationDate
                    ? new Date(item.publicationDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Not scheduled";

                  const formattedUpdated = new Date(item.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/60 transition-colors group"
                    >
                      {/* Title & Cover */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            <Image
                              src={item.coverImage || "/images/Magazine.png"}
                              alt={item.title}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          </div>
                          <div className="space-y-0.5 max-w-xs sm:max-w-md">
                            <h3 className="font-bold text-[#171717] group-hover:text-emerald-800 transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span className="font-mono text-[11px] text-gray-500">
                                /{item.slug}
                              </span>
                              {item.pdfAsset && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  <FileText className="w-2.5 h-2.5" />
                                  <span>PDF Attached</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-xs text-gray-500">
                        {formattedDate}
                      </td>

                      {/* Updated */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-gray-500">
                        {formattedUpdated}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Live Preview link if published */}
                          {item.status === "published" && (
                            <Link
                              href={`/magazines/${item.slug}`}
                              target="_blank"
                              title="View on Public Site"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Quick Publish / Unpublish Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            disabled={isLoading}
                            title={
                              item.status === "published"
                                ? "Unpublish (Move to Draft)"
                                : "Publish to Live Site"
                            }
                            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              item.status === "published"
                                ? "text-amber-700 hover:bg-amber-50"
                                : "text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            ) : item.status === "published" ? (
                              <span className="hidden sm:inline-block">Unpublish</span>
                            ) : (
                              <span className="hidden sm:inline-block">Publish</span>
                            )}
                          </button>

                          {/* Edit Button (Popup Dialog) */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMagazine({
                                id: item.id,
                                title: item.title,
                                slug: item.slug,
                                edition: item.edition || "",
                                description: item.description || "",
                                coverImage: item.coverImage || "",
                                coverImagePublicId: item.coverImagePublicId || "",
                                pdfAsset: item.pdfAsset || "",
                                pdfAssetPublicId: item.pdfAssetPublicId || "",
                                publicationDate: item.publicationDate
                                  ? new Date(item.publicationDate).toISOString().slice(0, 10)
                                  : "",
                                publicationYear: item.publicationYear || undefined,
                                isFeatured: Boolean(item.isFeatured),
                                status: (item.status as "draft" | "published" | "archived") || "draft",
                              });
                              setModalOpen(true);
                            }}
                            title="Edit Magazine Edition"
                            className="p-1.5 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            title="Delete Magazine"
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
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
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#171717]">
              No magazines found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "No publications matched your filter criteria. Try clearing the search or status filter."
                : "You haven't uploaded any magazine issues yet. Get started by adding your first publication."}
            </p>
            <div className="pt-2">
              <Link
                href="/admin/magazines/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload First Magazine</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal Dialog */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#171717]">
                Delete Publication?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-gray-900">
                  &ldquo;{deleteTarget.title}&rdquo;
                </span>
                ? This will remove the edition from the database and public listings.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Publication</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Modal Dialog for Creating & Editing Magazines */}
      <MagazineModalDialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refreshMagazines}
        initialData={editingMagazine}
      />
    </div>
  );
}
