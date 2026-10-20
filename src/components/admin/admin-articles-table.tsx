"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  FileText,
  Star,
  RefreshCw,
  Loader2,
} from "lucide-react";

export interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  authorName: string | null;
  authorEmail: string | null;
  coverImage: string | null;
  coverImagePublicId?: string | null;
  status: string;
  isFeatured: boolean;
  publishedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  category: { id: string; name: string; slug: string } | null;
  author: { name: string; email: string } | null;
}

export function AdminArticlesTable() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArticleRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);

      const res = await fetch(`/api/admin/articles?${params.toString()}`);
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (err) {
      console.error("Failed to load articles:", err);
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
      loadArticles();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadArticles]);

  // Toggle Publish / Unpublish
  const handleTogglePublish = async (article: ArticleRow) => {
    const nextStatus = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setTogglingId(article.id);

    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update status.");
        return;
      }

      setArticles((prev) =>
        prev.map((item) => (item.id === article.id ? { ...item, status: nextStatus } : item))
      );
      router.refresh();
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setTogglingId(null);
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (article: ArticleRow) => {
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !article.isFeatured }),
      });

      if (res.ok) {
        setArticles((prev) =>
          prev.map((item) =>
            item.id === article.id ? { ...item, isFeatured: !item.isFeatured } : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle feature:", err);
    }
  };

  // Delete Article
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/articles/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete article.");
        setDeleting(false);
        return;
      }

      setArticles((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
      case "published":
        return "bg-green-100 text-green-800 border-green-300";
      case "DRAFT":
      case "draft":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "APPROVED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "SUBMITTED":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "REVISION_REQUESTED":
        return "bg-orange-50 text-orange-800 border-orange-200";
      case "REJECTED":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            All Articles & Editorial Pieces
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage all publications, draft new articles, feature key stories, and update live content.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-xs transition-all hover:scale-[1.02] active:scale-95 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Article</span>
        </Link>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 p-3 rounded-2xl bg-white border border-gray-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by article title, author, or slug..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="APPROVED">Approved</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="REVISION_REQUESTED">Revision Requested</option>
            <option value="REJECTED">Rejected</option>
          </select>

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

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading && articles.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading articles...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-8 h-8 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">No articles match your query</h3>
            <p className="text-xs text-gray-500">
              Try adjusting your search keywords or clear filters to see all publications.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3 px-4 sm:px-6">Article</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4">Published / Created</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((item) => {
                  const authorDisplay =
                    item.authorName || item.author?.name || "BBST Contributor";
                  const dateStr = item.publishedAt
                    ? new Date(item.publishedAt).toLocaleDateString()
                    : new Date(item.createdAt).toLocaleDateString();

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* Title & Cover */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            {item.coverImage ? (
                              <Image
                                src={item.coverImage}
                                alt={item.title}
                                fill
                                sizes="44px"
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
                              href={`/admin/articles/${item.id}/edit`}
                              className="font-bold text-[#171717] hover:text-emerald-700 transition-colors line-clamp-1"
                            >
                              {item.title}
                            </Link>
                            <span className="font-mono text-[11px] text-gray-400 block truncate">
                              /{item.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-gray-700">
                        {authorDisplay}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-gray-700">
                        {item.category?.name || "General"}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Featured Star */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(item)}
                          title={item.isFeatured ? "Unfeature article" : "Feature article"}
                          className="p-1 rounded-lg text-gray-400 hover:text-amber-500 transition-colors cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              item.isFeatured ? "fill-amber-400 text-amber-500" : ""
                            }`}
                          />
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-gray-500">{dateStr}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Live Link if published */}
                          {(item.status === "PUBLISHED" || item.status === "published") && (
                            <Link
                              href={`/articles/${item.slug}`}
                              target="_blank"
                              title="View on live site"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Quick Publish / Unpublish Toggle */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(item)}
                            disabled={togglingId === item.id}
                            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              item.status === "PUBLISHED" || item.status === "published"
                                ? "text-amber-700 hover:bg-amber-50"
                                : "text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {togglingId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : item.status === "PUBLISHED" || item.status === "published" ? (
                              <span className="hidden sm:inline">Unpublish</span>
                            ) : (
                              <span className="hidden sm:inline">Publish</span>
                            )}
                          </button>

                          {/* Edit */}
                          <Link
                            href={`/admin/articles/${item.id}/edit`}
                            title="Edit Article"
                            className="p-1.5 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            title="Delete Article"
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Article?</h3>
            <p className="text-xs text-gray-600">
              Are you sure you want to permanently delete &ldquo;{deleteTarget.title}&rdquo;? This
              action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
