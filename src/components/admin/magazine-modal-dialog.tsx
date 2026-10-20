"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export interface MagazineFormData {
  id?: string;
  title: string;
  slug: string;
  edition?: string;
  description?: string;
  publicationDate?: string;
  publicationYear?: number;
  isFeatured?: boolean;
  status: "draft" | "published" | "archived";
  coverImage?: string;
  coverImagePublicId?: string;
  pdfAsset?: string;
  pdfAssetPublicId?: string;
}

interface MagazineModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: MagazineFormData | null;
}

function MagazineModalContent({
  onClose,
  onSuccess,
  initialData,
}: {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: MagazineFormData | null;
}) {
  const isEditing = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [edition, setEdition] = useState(initialData?.edition || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [publicationDate, setPublicationDate] = useState(
    initialData?.publicationDate
      ? new Date(initialData.publicationDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [publicationYear, setPublicationYear] = useState<number>(
    initialData?.publicationYear || new Date().getFullYear()
  );
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.isFeatured));
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    initialData?.status || "draft"
  );

  // Cover image upload
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [coverImagePublicId, setCoverImagePublicId] = useState(
    initialData?.coverImagePublicId || ""
  );
  const [coverPreview, setCoverPreview] = useState(initialData?.coverImage || "");
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // PDF asset upload
  const [pdfAsset, setPdfAsset] = useState(initialData?.pdfAsset || "");
  const [pdfAssetPublicId, setPdfAssetPublicId] = useState(
    initialData?.pdfAssetPublicId || ""
  );
  const [pdfFileName, setPdfFileName] = useState(
    initialData?.pdfAsset ? "Current PDF attached" : ""
  );
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(generated);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Cover must be a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    setUploadingCover(true);
    setErrorMessage("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      setCoverPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");
      formData.append("folder", "bbst-magazine/magazine-covers");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload cover.");

      setCoverImage(data.url);
      setCoverImagePublicId(data.publicId || "");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cover upload failed.";
      setErrorMessage(msg);
      setCoverPreview("");
      setCoverImage("");
    } finally {
      setUploadingCover(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please select an official PDF publication document.");
      return;
    }

    setUploadingPdf(true);
    setErrorMessage("");
    setPdfFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "pdf");
      formData.append("folder", "bbst-magazine/pdfs");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload PDF.");

      setPdfAsset(data.url);
      setPdfAssetPublicId(data.publicId || "");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "PDF upload failed.";
      setErrorMessage(msg);
      setPdfAsset("");
      setPdfFileName("");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim() || !slug.trim()) {
      setErrorMessage("Title and slug are required.");
      return;
    }

    if (!pdfAsset) {
      setErrorMessage("Please upload an official PDF document for this edition.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        edition: edition.trim() || null,
        description: description.trim() || null,
        publicationDate: publicationDate ? new Date(publicationDate).toISOString() : null,
        publicationYear: publicationYear || new Date().getFullYear(),
        isFeatured,
        status,
        coverImage: coverImage || "/images/Magazine.png",
        coverImagePublicId: coverImagePublicId || null,
        pdfAsset,
        pdfAssetPublicId: pdfAssetPublicId || null,
      };

      const url = isEditing
        ? `/api/admin/magazines/${initialData?.id}`
        : "/api/admin/magazines";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save magazine.");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while saving.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
      {/* Modal Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Sparkles className="w-4 h-4 text-[#00C800]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
              {isEditing ? "Edit Magazine Edition" : "Add Magazine Edition"}
            </h2>
            <span className="text-[11px] text-gray-500">
              {isEditing
                ? "Update metadata, replacement files, or publishing state"
                : "Publish or draft an official BBST student publication"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Modal Body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section: Title & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="modal-mag-title" className="text-xs font-bold text-gray-700">
              Magazine Title <span className="text-red-500">*</span>
            </label>
            <input
              id="modal-mag-title"
              type="text"
              required
              placeholder="e.g. BBST Student Magazine — Vol 02 / 2025"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="modal-mag-slug" className="text-xs font-bold text-gray-700">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              id="modal-mag-slug"
              type="text"
              required
              placeholder="e.g. bbst-student-magazine-vol-02-2025"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
            />
          </div>
        </div>

        {/* Section: Edition & Year */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="modal-mag-edition" className="text-xs font-bold text-gray-700">
              Edition Label
            </label>
            <input
              id="modal-mag-edition"
              type="text"
              placeholder="e.g. Volume 02, Annual Edition"
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="modal-mag-date" className="text-xs font-bold text-gray-700">
              Publication Date
            </label>
            <input
              id="modal-mag-date"
              type="date"
              value={publicationDate}
              onChange={(e) => setPublicationDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="modal-mag-year" className="text-xs font-bold text-gray-700">
              Publication Year
            </label>
            <input
              id="modal-mag-year"
              type="number"
              min={2015}
              max={2035}
              value={publicationYear}
              onChange={(e) => setPublicationYear(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
            />
          </div>
        </div>

        {/* Section: Description */}
        <div className="space-y-1">
          <label htmlFor="modal-mag-desc" className="text-xs font-bold text-gray-700">
            Description / Editorial Overview
          </label>
          <textarea
            id="modal-mag-desc"
            rows={2}
            placeholder="Highlighting key campus research, student editorial essays, and fieldwork chronicles..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
          />
        </div>

        {/* Section: Cover Image & PDF Uploads */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Cover Image Upload Card */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <span className="text-xs font-bold text-gray-700 block">Cover Image</span>
            <div className="flex items-center gap-3">
              {coverPreview ? (
                <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-gray-300 shrink-0">
                  <Image src={coverPreview} alt="Cover" fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-16 h-20 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
              )}
              <div className="space-y-1 text-xs">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingCover}
                  onClick={() => coverInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploadingCover ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{coverImage ? "Replace" : "Upload Image"}</span>
                </button>
                <p className="text-[10px] text-gray-400">PNG, JPG, WebP up to 10MB</p>
              </div>
            </div>
          </div>

          {/* PDF Upload Card */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <span className="text-xs font-bold text-gray-700 block">
              PDF Document <span className="text-red-500">*</span>
            </span>
            <div className="space-y-2">
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingPdf}
                onClick={() => pdfInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                {uploadingPdf ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading PDF...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>{pdfAsset ? "Replace PDF Document" : "Select PDF Document"}</span>
                  </>
                )}
              </button>
              {pdfFileName && (
                <p className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate">{pdfFileName}</span>
                </p>
              )}
              <p className="text-[10px] text-gray-400">Official edition PDF up to 50MB</p>
            </div>
          </div>
        </div>

        {/* Section: Status & Featured */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
          <div className="space-y-1">
            <label htmlFor="modal-mag-status" className="text-xs font-bold text-gray-700 block">
              Publication Status
            </label>
            <select
              id="modal-mag-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "published" | "archived")}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none"
            >
              <option value="draft">Draft (Private to Editors)</option>
              <option value="published">Published (Live on /magazines)</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-4 sm:pt-0">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-gray-800">
              Highlight as Featured Flagship Edition
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploadingCover || uploadingPdf}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEditing ? "Save Changes" : "Create Magazine"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export function MagazineModalDialog({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: MagazineModalDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <MagazineModalContent
        key={initialData?.id || "new-magazine"}
        onClose={onClose}
        onSuccess={onSuccess}
        initialData={initialData}
      />
    </div>
  );
}
