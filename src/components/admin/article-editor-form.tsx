"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
  X,
  Send,
  Save,
  Search,
  UserCheck,
  UserPlus,
  ExternalLink,
} from "lucide-react";

export interface ArticleFormInitialData {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: string | null;
  coverImagePublicId?: string | null;
  authorName?: string | null;
  authorEmail?: string | null;
  authorDept?: string | null;
  writerId?: string | null;
  categoryId?: string | null;
  tags?: string | null;
  status?: string;
  isFeatured?: boolean;
  submissionSource?: string | null;
  editorialNotes?: string | null;
}

export interface WriterOption {
  id: string;
  name: string;
  slug?: string;
  department?: string | null;
  role?: string | null;
  academicYear?: string | null;
  profileImageUrl?: string | null;
  email?: string | null;
  _count?: { articles: number };
}

interface ArticleEditorFormProps {
  initialData?: ArticleFormInitialData;
}

export function ArticleEditorForm({ initialData }: ArticleEditorFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [authorName, setAuthorName] = useState(initialData?.authorName || "");
  const [authorEmail, setAuthorEmail] = useState(initialData?.authorEmail || "");
  const [authorDept, setAuthorDept] = useState(initialData?.authorDept || "");
  const [writerId, setWriterId] = useState(initialData?.writerId || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [tags, setTags] = useState(initialData?.tags || "");
  const [status, setStatus] = useState<string>(initialData?.status || "DRAFT");
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(initialData?.isFeatured));
  const [submissionSource, setSubmissionSource] = useState(
    initialData?.submissionSource || "Direct Editor Entry"
  );
  const [editorialNotes, setEditorialNotes] = useState(initialData?.editorialNotes || "");

  // Categories & Writers
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [writersList, setWritersList] = useState<WriterOption[]>([]);
  const [writerSearch, setWriterSearch] = useState("");
  const [isWriterDropdownOpen, setIsWriterDropdownOpen] = useState(false);
  const [isNewWriterModalOpen, setIsNewWriterModalOpen] = useState(false);

  // Quick Register Writer modal state
  const [newWriterName, setNewWriterName] = useState("");
  const [newWriterDept, setNewWriterDept] = useState("Bio-Systems Technology");
  const [newWriterRole, setNewWriterRole] = useState("Student Contributor");
  const [newWriterYear, setNewWriterYear] = useState("");
  const [newWriterEmail, setNewWriterEmail] = useState("");
  const [newWriterBio, setNewWriterBio] = useState("");
  const [savingNewWriter, setSavingNewWriter] = useState(false);
  const [newWriterError, setNewWriterError] = useState("");

  // Cover image upload
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [coverImagePublicId, setCoverImagePublicId] = useState(
    initialData?.coverImagePublicId || ""
  );
  const [imagePreview, setImagePreview] = useState(initialData?.coverImage || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Status & notifications
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Preview Modal
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, writersRes] = await Promise.all([
          fetch("/api/admin/categories"),
          fetch("/api/admin/writers?pageSize=100"),
        ]);
        const catJson = await catRes.json();
        if (catJson.categories && catJson.categories.length > 0) {
          setCategories(catJson.categories);
          if (!categoryId && !isEditing) {
            setCategoryId(catJson.categories[0].id);
          }
        }
        const writersJson = await writersRes.json();
        if (writersJson.writers) {
          setWritersList(writersJson.writers);
        }
      } catch (err) {
        console.error("Failed to load form dependencies:", err);
      }
    }
    loadData();
  }, [categoryId, isEditing]);

  // Derived selected writer
  const selectedWriter = writersList.find((w) => w.id === writerId) || null;

  // Filtered writers for searchable dropdown
  const filteredWriters = writersList.filter((w) => {
    if (!writerSearch.trim()) return true;
    const q = writerSearch.toLowerCase().trim();
    return (
      w.name.toLowerCase().includes(q) ||
      (w.department && w.department.toLowerCase().includes(q)) ||
      (w.email && w.email.toLowerCase().includes(q))
    );
  });

  // Suggested writer if manual authorName matches a registered profile
  const suggestedWriter =
    !writerId && authorName.trim()
      ? writersList.find((w) => {
          const q = authorName.trim().toLowerCase();
          return w.name.toLowerCase() === q || w.name.toLowerCase().includes(q);
        })
      : null;

  const handleSelectWriter = (w: WriterOption) => {
    setWriterId(w.id);
    setAuthorName(w.name);
    if (w.department) setAuthorDept(w.department);
    if (w.email) setAuthorEmail(w.email);
    setIsWriterDropdownOpen(false);
    setWriterSearch("");
  };

  const handleQuickRegisterWriter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWriterName.trim()) {
      setNewWriterError("Writer full name is required.");
      return;
    }
    setSavingNewWriter(true);
    setNewWriterError("");

    try {
      const res = await fetch("/api/admin/writers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWriterName.trim(),
          department: newWriterDept.trim() || undefined,
          role: newWriterRole.trim() || undefined,
          academicYear: newWriterYear.trim() || undefined,
          email: newWriterEmail.trim() || undefined,
          shortBio: newWriterBio.trim() || undefined,
          bio: newWriterBio.trim() || undefined,
          status: "PUBLISHED",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.writer) {
        throw new Error(data.error || "Failed to register writer.");
      }

      const createdWriter: WriterOption = data.writer;
      setWritersList((prev) => [createdWriter, ...prev]);

      // Automatically select and link the newly registered writer
      handleSelectWriter(createdWriter);

      setNewWriterName("");
      setNewWriterYear("");
      setNewWriterEmail("");
      setNewWriterBio("");
      setIsNewWriterModalOpen(false);
      setSuccessMessage(`Writer "${createdWriter.name}" registered and linked successfully.`);
    } catch (err: unknown) {
      setNewWriterError(err instanceof Error ? err.message : "Failed to register writer.");
    } finally {
      setSavingNewWriter(false);
    }
  };

  // Auto-generate slug when title changes (if not editing)
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 60);
      setSlug(generated);
    }
  };

  // Upload Cover Image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    setUploadingImage(true);
    setErrorMessage("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");
      formData.append("folder", "bbst-magazine/article-covers");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image.");

      setCoverImage(data.url);
      setCoverImagePublicId(data.publicId || "");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cover upload failed.";
      setErrorMessage(msg);
      setImagePreview("");
      setCoverImage("");
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Handler
  const handleSave = async (targetStatus?: string) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!title.trim()) {
      setErrorMessage("Article title is required.");
      return;
    }

    if (!authorName.trim()) {
      setErrorMessage("Author / Contributor name is required.");
      return;
    }

    if (!content.trim()) {
      setErrorMessage("Article content is required.");
      return;
    }

    const finalStatus = targetStatus || status;
    setSaving(true);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || null,
        content,
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim() || null,
        authorDept: authorDept.trim() || null,
        writerId: writerId || null,
        categoryId: categoryId || null,
        coverImage: coverImage || null,
        coverImagePublicId: coverImagePublicId || null,
        tags: tags.trim() || null,
        status: finalStatus,
        isFeatured,
        submissionSource: submissionSource || "Direct Editor Entry",
        editorialNotes: editorialNotes.trim() || null,
      };

      const url = isEditing
        ? `/api/admin/articles/${initialData?.id}`
        : "/api/admin/articles";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save article.");
      }

      setSuccessMessage(
        isEditing
          ? "Article updated successfully."
          : "Article created successfully."
      );

      if (!isEditing && data.article?.id) {
        router.push(`/admin/articles`);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save article.";
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            disabled={saving || uploadingImage}
            onClick={() => handleSave("DRAFT")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={saving || uploadingImage}
            onClick={() => handleSave("PUBLISHED")}
            className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-xl text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isEditing ? "Update & Publish" : "Publish Article"}</span>
          </button>
        </div>
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

      {/* Main Form Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-gray-200/90 shadow-sm space-y-8">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            {isEditing ? "Edit Existing Article" : "Workflow B: Contributor & Editorial Creation"}
          </span>
          <h1 className="text-2xl font-black text-[#171717] mt-2">
            {isEditing ? `Edit: ${title || "Untitled"}` : "Create or Transcribe Article"}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Publish articles written directly or received via email, Word documents, or student contributors.
          </p>
        </div>

        {/* Section 1: Article Identity */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">
              Article Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Next-Generation Bio-Sensors for Tea Leaf Disease Detection"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="e.g. next-gen-bio-sensors"
                className="w-full px-4 py-2.5 text-sm font-mono rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Summary / Abstract</label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief excerpt displayed on article cards..."
              className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
            />
          </div>
        </div>

        {/* Section 2: Contributor Attribution */}
        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Original Writer & Attribution Information
              </h3>
            </div>
            <Link
              href="/admin/writers/new"
              target="_blank"
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 hover:border-emerald-300 transition-colors"
            >
              + Add New Writer Profile
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            Associate this article with a registered writer profile to link public attribution,
            or enter manual attribution details below.
          </p>

          {/* Exact Registered Writer Connection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Exact Registered Writer (Writer Profile)</span>
              </label>
              {selectedWriter && (
                <button
                  type="button"
                  onClick={() => {
                    setWriterId("");
                    setIsWriterDropdownOpen(true);
                  }}
                  className="text-[11px] font-semibold text-gray-500 hover:text-black cursor-pointer"
                >
                  Change Writer
                </button>
              )}
            </div>

            {selectedWriter ? (
              /* Connected Writer Card */
              <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-emerald-200 shrink-0 shadow-xs">
                      <Image
                        src={selectedWriter.profileImageUrl || "/images/avatar1.jpg"}
                        alt={selectedWriter.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-[#171717] truncate">{selectedWriter.name}</h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          Exact Match Connected
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium truncate mt-0.5">
                        {selectedWriter.department || "BBST Department"} {selectedWriter.role ? `• ${selectedWriter.role}` : ""}
                      </p>
                      {selectedWriter.email && (
                        <p className="text-[11px] text-gray-500 font-mono truncate">{selectedWriter.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {selectedWriter.slug && (
                      <Link
                        href={`/writers/${selectedWriter.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/60 shadow-2xs transition-colors"
                      >
                        <span>Preview Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setWriterId("");
                        setIsWriterDropdownOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setWriterId("")}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Unlink profile"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-900 bg-white/90 p-2.5 rounded-xl border border-emerald-200/80 flex items-start sm:items-center gap-2 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                  <span>
                    <strong>Portfolio Synced:</strong> When users search for <strong>{selectedWriter.name}</strong> or visit their writer profile at <code>/writers/{selectedWriter.slug || "profile"}</code>, this article will appear directly in their written portfolio.
                  </span>
                </div>
              </div>
            ) : (
              /* Searchable Selector & Register Writer Actions */
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={writerSearch}
                      onChange={(e) => {
                        setWriterSearch(e.target.value);
                        setIsWriterDropdownOpen(true);
                      }}
                      onFocus={() => setIsWriterDropdownOpen(true)}
                      placeholder="Search registered writer by name, department, or email..."
                      className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00E500]"
                    />
                    {writerSearch && (
                      <button
                        type="button"
                        onClick={() => setWriterSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Filtered Dropdown */}
                    {isWriterDropdownOpen && (
                      <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto rounded-2xl bg-white border border-gray-200 shadow-xl divide-y divide-gray-100">
                        <div className="p-2.5 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between sticky top-0 z-10">
                          <span>Select Exact Registered Writer ({filteredWriters.length})</span>
                          <button
                            type="button"
                            onClick={() => setIsWriterDropdownOpen(false)}
                            className="text-gray-400 hover:text-black cursor-pointer text-xs font-semibold"
                          >
                            Close
                          </button>
                        </div>

                        {filteredWriters.length === 0 ? (
                          <div className="p-5 text-center space-y-2.5">
                            <p className="text-xs text-gray-500">
                              No registered writer found matching &ldquo;{writerSearch}&rdquo;.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setNewWriterName(writerSearch.trim() || authorName.trim() || "");
                                setIsNewWriterModalOpen(true);
                                setIsWriterDropdownOpen(false);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-xs cursor-pointer transition-all"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Register &ldquo;{writerSearch.trim() || "New Writer"}&rdquo; Now</span>
                            </button>
                          </div>
                        ) : (
                          filteredWriters.map((w) => (
                            <button
                              key={w.id}
                              type="button"
                              onClick={() => handleSelectWriter(w)}
                              className="w-full text-left p-3 hover:bg-emerald-50/80 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                  <Image
                                    src={w.profileImageUrl || "/images/avatar1.jpg"}
                                    alt={w.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-800 truncate">
                                    {w.name}
                                  </p>
                                  <p className="text-[11px] text-gray-500 truncate">
                                    {w.department || "BBST Department"} {w.role ? `• ${w.role}` : ""}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 group-hover:bg-[#00E500] group-hover:text-black group-hover:border-[#00E500] transition-colors shrink-0">
                                Connect Exact Writer
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Register New Writer Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setNewWriterName(authorName || writerSearch || "");
                      setIsNewWriterModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Register New Writer</span>
                  </button>
                </div>

                {/* Auto-matching suggestion */}
                {suggestedWriter && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate">
                        Registered writer match found: <strong>{suggestedWriter.name}</strong> ({suggestedWriter.department || "BBST Department"})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectWriter(suggestedWriter)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-200 hover:bg-amber-300 text-amber-950 shrink-0 transition-colors cursor-pointer self-end sm:self-auto"
                    >
                      Connect This Profile
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                Writer&apos;s Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Nimali Jayasinghe"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Writer&apos;s Email</label>
              <input
                type="email"
                placeholder="e.g. nimali@uwu.ac.lk"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Department / Major</label>
              <input
                type="text"
                placeholder="e.g. Food Science & Technology"
                value={authorDept}
                onChange={(e) => setAuthorDept(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Submission Channel / Source</label>
              <select
                value={submissionSource}
                onChange={(e) => setSubmissionSource(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-900"
              >
                <option value="Direct Editor Entry">Direct Editorial Composition</option>
                <option value="Email Submission">Received via Editorial Email</option>
                <option value="Word Document">Word Document Attachment</option>
                <option value="PDF Document">PDF Submission</option>
                <option value="Google Docs">Google Docs / Cloud Link</option>
                <option value="Web Submission">Web Portal Submission</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Internal Editorial Notes</label>
              <input
                type="text"
                placeholder="e.g. Proofread by Prof. Silva; images approved"
                value={editorialNotes}
                onChange={(e) => setEditorialNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Cover Image Upload */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Cover Image</h3>
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-gray-50 border border-gray-200">
            {imagePreview ? (
              <div className="relative w-40 h-28 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("");
                    setCoverImage("");
                    setCoverImagePublicId("");
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-40 h-28 rounded-xl bg-gray-200 flex flex-col items-center justify-center text-gray-400 shrink-0">
                <Upload className="w-6 h-6 mb-1 text-gray-400" />
                <span className="text-[10px]">No image</span>
              </div>
            )}

            <div className="space-y-2 flex-1">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => coverInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                {uploadingImage ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>{coverImage ? "Replace Cover" : "Upload Cover Image"}</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-gray-400">
                High resolution banner image for article headers (JPEG, PNG, WebP up to 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Rich Text Content */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 block">
            Article Manuscript & Content <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Write or paste the full article content..."
            minHeight="340px"
          />
        </div>

        {/* Section 5: Metadata & Status Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Workflow Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none"
              >
                <option value="DRAFT">Draft</option>
                <option value="APPROVED">Approved</option>
                <option value="PUBLISHED">Published (Live)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Tags</label>
              <input
                type="text"
                placeholder="e.g. Science, Agriculture, AI"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-900"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-gray-800">Feature this Article</span>
          </label>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/admin/articles"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={saving || uploadingImage}
            onClick={() => handleSave()}
            className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEditing ? "Save Article Changes" : "Save & Finish"}</span>
          </button>
        </div>
      </div>

      {/* Quick Register Writer Modal */}
      {isNewWriterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#171717]">Register New Contributor</h3>
                  <p className="text-[11px] text-gray-500">Create public profile and connect to this article</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewWriterModalOpen(false)}
                className="text-gray-400 hover:text-black p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newWriterError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{newWriterError}</span>
              </div>
            )}

            <form onSubmit={handleQuickRegisterWriter} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newWriterName}
                  onChange={(e) => setNewWriterName(e.target.value)}
                  placeholder="e.g. Kasun Rajapakshe"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00E500]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">
                    Department / Faculty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newWriterDept}
                    onChange={(e) => setNewWriterDept(e.target.value)}
                    placeholder="e.g. Bio-Systems Technology"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00E500]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Role / Designation</label>
                  <input
                    type="text"
                    value={newWriterRole}
                    onChange={(e) => setNewWriterRole(e.target.value)}
                    placeholder="e.g. Student Contributor"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00E500]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Email Address</label>
                  <input
                    type="email"
                    value={newWriterEmail}
                    onChange={(e) => setNewWriterEmail(e.target.value)}
                    placeholder="e.g. kasun@uwu.ac.lk"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00E500]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Academic Year / Batch</label>
                  <input
                    type="text"
                    value={newWriterYear}
                    onChange={(e) => setNewWriterYear(e.target.value)}
                    placeholder="e.g. 2021/2022"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00E500]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Bio / Research Focus</label>
                <textarea
                  rows={2}
                  value={newWriterBio}
                  onChange={(e) => setNewWriterBio(e.target.value)}
                  placeholder="e.g. Undergraduate researcher focusing on bio-sensors and IoT agriculture."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00E500]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewWriterModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNewWriter}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingNewWriter ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Register & Connect</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Live Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {coverImage && (
                <div className="relative w-full h-60 rounded-xl overflow-hidden">
                  <Image src={coverImage} alt={title} fill className="object-cover" unoptimized />
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900">{title || "Untitled Article"}</h2>
              <p className="text-xs text-gray-500">
                By {authorName || "BBST Contributor"} • {authorDept || "Department"}
              </p>
              {excerpt && <p className="text-sm text-gray-600 italic">{excerpt}</p>}
              <div
                className="prose prose-sm max-w-none text-gray-800 pt-2"
                dangerouslySetInnerHTML={{ __html: content || "<p>No content provided.</p>" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
