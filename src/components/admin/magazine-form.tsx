"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

interface InitialMagazineData {
  id?: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  pdfAsset?: string | null;
  publicationDate?: string | Date | null;
  status: "draft" | "published" | "archived";
}

interface MagazineFormProps {
  initialData?: InitialMagazineData;
  isEditing?: boolean;
}

export function MagazineForm({ initialData, isEditing = false }: MagazineFormProps) {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(initialData?.slug));
  const [description, setDescription] = useState(initialData?.description || "");
  const [publicationDate, setPublicationDate] = useState<string>(() => {
    if (initialData?.publicationDate) {
      const d = new Date(initialData.publicationDate);
      return !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";
    }
    return new Date().toISOString().split("T")[0];
  });
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    initialData?.status || "published"
  );

  // Files & Upload state
  const currentCoverUrl = initialData?.coverImage || null;
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  const currentPdfUrl = initialData?.pdfAsset || null;
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // UI state
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto slug generation from title if user hasn't manually edited
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  // Cover image selection handler
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Cover image size must not exceed 10MB.");
      return;
    }

    setCoverFile(file);
    setCoverPreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  // PDF selection handler
  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please select a valid PDF document.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("PDF document size must not exceed 50MB.");
      return;
    }

    setPdfFile(file);
    setErrorMessage(null);
  };

  // Upload helper for single asset
  const uploadAssetFile = async (file: File, type: "pdf" | "image"): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Failed to upload ${type}.`);
    }

    return data.url;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!title.trim()) {
      setErrorMessage("Magazine title is required.");
      return;
    }

    if (!slug.trim()) {
      setErrorMessage("Publication slug is required.");
      return;
    }

    if (!pdfFile && !currentPdfUrl) {
      setErrorMessage("Please upload a publication PDF file.");
      return;
    }

    setSubmitting(true);

    try {
      let finalPdfUrl = currentPdfUrl;
      let finalCoverUrl = currentCoverUrl;

      // 1. Upload PDF if a new one was selected
      if (pdfFile) {
        setUploadingPdf(true);
        finalPdfUrl = await uploadAssetFile(pdfFile, "pdf");
        setUploadingPdf(false);
      }

      // 2. Upload Cover Image if a new one was selected
      if (coverFile) {
        setUploadingCover(true);
        finalCoverUrl = await uploadAssetFile(coverFile, "image");
        setUploadingCover(false);
      }

      // 3. Save magazine to database via API
      const endpoint = isEditing
        ? `/api/admin/magazines/${initialData?.id}`
        : "/api/admin/magazines";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        coverImage: finalCoverUrl || "/images/Magazine.png",
        pdfAsset: finalPdfUrl,
        publicationDate: publicationDate ? new Date(publicationDate).toISOString() : null,
        status,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        setErrorMessage(resData.error || "Failed to save magazine.");
        setSubmitting(false);
        return;
      }

      setSuccessMessage(
        isEditing
          ? "Magazine updated successfully!"
          : "Magazine created and published successfully!"
      );

      setTimeout(() => {
        router.push("/admin/magazines");
        router.refresh();
      }, 800);
    } catch (err) {
      console.error("[MagazineForm] Error saving magazine:", err);
      const msg = err instanceof Error ? err.message : "Failed to save magazine.";
      setErrorMessage(msg);
      setSubmitting(false);
      setUploadingPdf(false);
      setUploadingCover(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/admin/magazines" className="hover:text-black transition-colors flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Magazines</span>
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">
          {isEditing ? "Edit Publication" : "Add New Publication"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            {isEditing ? "Edit Magazine Edition" : "Publish New Magazine Edition"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Upload PDF files, provide issue metadata, and configure publication visibility.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#00C800] shrink-0 mt-0.5" />
          <span className="leading-relaxed font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-2xs space-y-6">
          <h2 className="text-base font-bold text-[#171717] border-b border-gray-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00C800]" />
            <span>Magazine Information</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="title" className="block text-xs font-bold text-gray-700">
                Magazine Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. BBST Student Magazine — Vol 03 / 2026"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-[#00C800] focus:ring-2 focus:ring-[#00FF00]/20 outline-none transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label htmlFor="slug" className="block text-xs font-bold text-gray-700">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs text-gray-400 font-mono">
                  /magazines/
                </span>
                <input
                  id="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setIsSlugManuallyEdited(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="bbst-magazine-vol-03-2026"
                  className="w-full pl-24 pr-4 py-2.5 text-sm font-mono rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-[#00C800] focus:ring-2 focus:ring-[#00FF00]/20 outline-none transition-all text-gray-900"
                />
              </div>
              <p className="text-[11px] text-gray-400">
                Lowercase alphanumeric and hyphens only.
              </p>
            </div>

            {/* Publication Date */}
            <div className="space-y-1.5">
              <label htmlFor="publicationDate" className="block text-xs font-bold text-gray-700">
                Publication Date
              </label>
              <div className="relative">
                <input
                  id="publicationDate"
                  type="date"
                  value={publicationDate}
                  onChange={(e) => setPublicationDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-[#00C800] focus:ring-2 focus:ring-[#00FF00]/20 outline-none transition-all text-gray-900"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="description" className="block text-xs font-bold text-gray-700">
                Editorial Synopsis &amp; Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summary of featured articles, research topics, student capstones, and editorial essays in this issue..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-[#00C800] focus:ring-2 focus:ring-[#00FF00]/20 outline-none transition-all placeholder:text-gray-400 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: PDF Document Upload */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-[#171717] border-b border-gray-100 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#00C800]" />
              <span>Publication PDF Asset <span className="text-red-500">*</span></span>
            </span>
            <span className="text-xs font-normal text-gray-500">Max size 50MB</span>
          </h2>

          {/* Current PDF info if editing */}
          {currentPdfUrl && !pdfFile && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Current PDF Attached</p>
                  <p className="text-[11px] text-gray-500 truncate max-w-sm">
                    {currentPdfUrl}
                  </p>
                </div>
              </div>
              <a
                href={currentPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                Download / Preview
              </a>
            </div>
          )}

          {/* Upload Drop Zone */}
          <div className="relative border-2 border-dashed border-gray-200 hover:border-[#00C800] rounded-2xl p-6 text-center transition-colors bg-gray-50/50 hover:bg-emerald-50/20">
            <input
              id="pdfFile"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto text-emerald-700 shadow-2xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#171717]">
                {pdfFile ? pdfFile.name : currentPdfUrl ? "Replace PDF Document" : "Upload Magazine PDF"}
              </p>
              <p className="text-xs text-gray-500">
                {pdfFile
                  ? `${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload`
                  : "Click or drag and drop your magazine PDF file here"}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Cover Image Upload */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-[#171717] border-b border-gray-100 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#00C800]" />
              <span>Cover Image (Optional)</span>
            </span>
            <span className="text-xs font-normal text-gray-500">Max size 10MB</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Preview Box */}
            <div className="sm:col-span-4 flex justify-center">
              <div className="relative w-36 aspect-3/4 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 shadow-md">
                <Image
                  src={coverPreviewUrl || currentCoverUrl || "/images/Magazine.png"}
                  alt="Magazine Cover Preview"
                  fill
                  sizes="144px"
                  className="object-cover"
                />
                {(coverPreviewUrl || currentCoverUrl) && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#00E500] text-black">
                    Preview
                  </div>
                )}
              </div>
            </div>

            {/* Drop Zone */}
            <div className="sm:col-span-8">
              <div className="relative border-2 border-dashed border-gray-200 hover:border-[#00C800] rounded-2xl p-6 text-center transition-colors bg-gray-50/50 hover:bg-emerald-50/20">
                <input
                  id="coverFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-1.5 pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center mx-auto text-emerald-700 shadow-2xs">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[#171717]">
                    {coverFile ? coverFile.name : "Select Cover Image"}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Supports PNG, JPG, or WebP. If omitted, the default BBST 3D cover is used.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Publishing Visibility */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-[#171717] border-b border-gray-100 pb-3">
            Publication Status
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                status === "published"
                  ? "border-[#00C800] bg-emerald-50/40 ring-1 ring-[#00C800]"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === "published"}
                onChange={() => setStatus("published")}
                className="mt-1 text-[#00E500] focus:ring-[#00E500]"
              />
              <div>
                <span className="block text-sm font-bold text-[#171717]">
                  Published (Live)
                </span>
                <span className="block text-xs text-gray-500 leading-normal mt-0.5">
                  Immediately visible to readers on the public /magazines page and reader modal.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                status === "draft"
                  ? "border-amber-400 bg-amber-50/40 ring-1 ring-amber-400"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === "draft"}
                onChange={() => setStatus("draft")}
                className="mt-1 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="block text-sm font-bold text-[#171717]">
                  Draft (Private)
                </span>
                <span className="block text-xs text-gray-500 leading-normal mt-0.5">
                  Saved securely in the CMS but completely hidden from public visitors.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Link
            href="/admin/magazines"
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-md shadow-[#00E500]/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {uploadingPdf
                    ? "Uploading PDF..."
                    : uploadingCover
                    ? "Uploading Cover..."
                    : "Saving Publication..."}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEditing ? "Save Changes" : status === "published" ? "Publish Edition" : "Save as Draft"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
