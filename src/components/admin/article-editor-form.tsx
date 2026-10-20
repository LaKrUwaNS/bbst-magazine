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
  const [writersList, setWritersList] = useState<
    Array<{
      id: string;
      name: string;
      department?: string | null;
      profileImageUrl?: string | null;
      email?: string | null;
    }>
  >([]);

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

          {/* Writer Profile Selector */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-white border border-gray-200">
            <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
              <span>Link Registered Writer Profile (Recommended)</span>
              {writerId && (
                <button
                  type="button"
                  onClick={() => setWriterId("")}
                  className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
                >
                  Unlink Profile
                </button>
              )}
            </label>
            <select
              value={writerId}
              onChange={(e) => {
                const selectedId = e.target.value;
                setWriterId(selectedId);
                const matched = writersList.find((w) => w.id === selectedId);
                if (matched) {
                  if (matched.name) setAuthorName(matched.name);
                  if (matched.department && !authorDept) setAuthorDept(matched.department);
                  if (matched.email && !authorEmail) setAuthorEmail(matched.email);
                }
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00E500] cursor-pointer"
            >
              <option value="">— No Writer Profile Linked (Plain Text Attribution) —</option>
              {writersList.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} {w.department ? `(${w.department})` : ""}
                </option>
              ))}
            </select>
            {writerId && (
              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-800 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Article is linked to public writer profile. Visitors can view their author card.</span>
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
