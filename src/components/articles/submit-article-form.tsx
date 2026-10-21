"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import {
  Upload,
  CheckCircle2,
  FileText,
  AlertCircle,
  ArrowRight,
  Search,
  Sparkles,
  RefreshCw,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export function SubmitArticleForm() {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref")?.trim() || "";
  const trackParam = searchParams.get("track");

  const [activeTab, setActiveTab] = useState<"submit" | "track">(() =>
    refParam || trackParam === "1" ? "track" : "submit"
  );

  // Categories loaded from DB
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Submission Form State
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorDept, setAuthorDept] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Cover image upload state
  const [coverImage, setCoverImage] = useState("");
  const [coverImagePublicId, setCoverImagePublicId] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission Status
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<{
    submissionRef: string;
    title: string;
  } | null>(null);

  // Tracking State
  const [trackRef, setTrackRef] = useState(() => refParam);
  const [trackingLoading, setTrackingLoading] = useState(() => Boolean(refParam));
  const [trackError, setTrackError] = useState("");
  const [trackedSubmission, setTrackedSubmission] = useState<{
    ref: string;
    title: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    authorName: string;
    categoryName: string;
    status: string;
    submittedAt: string;
    reviewedAt: string | null;
    editorialFeedback: string | null;
    rejectionReason: string | null;
    publishedAt: string | null;
    slug: string | null;
  } | null>(null);

  // Resubmission modal / mode
  const [resubmitting, setResubmitting] = useState(false);
  const [revisedContent, setRevisedContent] = useState("");
  const [revisedTitle, setRevisedTitle] = useState("");
  const [resubmitSuccess, setResubmitSuccess] = useState(false);

  // Adjust state during render when URL query parameters change across navigations
  const [prevRefParam, setPrevRefParam] = useState(refParam);
  if (refParam !== prevRefParam) {
    setPrevRefParam(refParam);
    if (refParam) {
      setActiveTab("track");
      setTrackRef(refParam);
      setTrackingLoading(true);
      setTrackError("");
      setTrackedSubmission(null);
    }
  }

  const [prevTrackParam, setPrevTrackParam] = useState(trackParam);
  if (trackParam !== prevTrackParam) {
    setPrevTrackParam(trackParam);
    if (trackParam === "1") {
      setActiveTab("track");
    }
  }

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (json.categories && json.categories.length > 0) {
          setCategories(json.categories);
          setCategoryId(json.categories[0].id);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Handle Cover Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image exceeds maximum permitted limit of 10MB.");
      return;
    }

    setUploadingImage(true);
    setErrorMessage("");

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/articles/upload-cover", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload cover image.");
      }

      setCoverImage(data.url);
      setCoverImagePublicId(data.publicId || "");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed.";
      setErrorMessage(msg);
      setImagePreview("");
      setCoverImage("");
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Article Handler
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!agreeTerms) {
      setErrorMessage("Please confirm that you agree to the publication guidelines.");
      return;
    }

    if (!content || content.replace(/<[^>]*>/g, "").trim().length < 50) {
      setErrorMessage("Article content is too short. Please provide at least 50 words.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/articles/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          authorName,
          authorEmail,
          authorDept,
          categoryId: categoryId || undefined,
          coverImage: coverImage || undefined,
          coverImagePublicId: coverImagePublicId || undefined,
          tags,
          agreeTerms,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit article.");
      }

      setSuccessData({
        submissionRef: data.submissionRef,
        title: data.title,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Track Submission Fetcher for manual search
  const fetchTrackRef = useCallback(async (refToSearch: string) => {
    if (!refToSearch.trim()) return;

    setTrackingLoading(true);
    setTrackError("");
    setTrackedSubmission(null);
    setResubmitSuccess(false);

    try {
      const res = await fetch(`/api/articles/track?ref=${encodeURIComponent(refToSearch.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission not found.");
      }
      setTrackedSubmission(data.submission);
      setRevisedTitle(data.submission.title);
      setRevisedContent(data.submission.content);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to find submission.";
      setTrackError(msg);
    } finally {
      setTrackingLoading(false);
    }
  }, []);

  // Automatically load tracked submission when ref is present in URL
  useEffect(() => {
    if (!refParam) return;

    let ignore = false;

    async function loadTrackedSubmission() {
      try {
        const res = await fetch(`/api/articles/track?ref=${encodeURIComponent(refParam)}`);
        const data = await res.json();
        if (ignore) return;
        if (!res.ok) {
          throw new Error(data.error || "Submission not found.");
        }
        setTrackedSubmission(data.submission);
        setRevisedTitle(data.submission.title);
        setRevisedContent(data.submission.content);
      } catch (err: unknown) {
        if (ignore) return;
        const msg = err instanceof Error ? err.message : "Failed to find submission.";
        setTrackError(msg);
      } finally {
        if (!ignore) {
          setTrackingLoading(false);
        }
      }
    }

    loadTrackedSubmission();

    return () => {
      ignore = true;
    };
  }, [refParam]);

  // Track Submission Form Handler
  const handleTrackSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackRef.trim()) return;
    await fetchTrackRef(trackRef);
  };

  // Resubmit Revised Draft Handler
  const handleResubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackedSubmission) return;

    setResubmitting(true);
    setTrackError("");

    try {
      const res = await fetch("/api/articles/resubmit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionRef: trackedSubmission.ref,
          title: revisedTitle,
          content: revisedContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resubmit revision.");
      }

      setResubmitSuccess(true);
      // Refresh tracked submission details
      setTrackedSubmission((prev) =>
        prev
          ? {
              ...prev,
              title: revisedTitle,
              content: revisedContent,
              status: "SUBMITTED",
              editorialFeedback: null,
            }
          : null
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resubmit revision.";
      setTrackError(msg);
    } finally {
      setResubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          label: "Submitted • In Review Queue",
        };
      case "UNDER_REVIEW":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          label: "Under Active Review",
        };
      case "REVISION_REQUESTED":
        return {
          bg: "bg-orange-50 text-orange-700 border-orange-200",
          label: "Revisions Requested",
        };
      case "APPROVED":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          label: "Approved for Publication",
        };
      case "PUBLISHED":
        return {
          bg: "bg-green-100 text-green-800 border-green-300",
          label: "Live & Published",
        };
      case "REJECTED":
        return {
          bg: "bg-red-50 text-red-700 border-red-200",
          label: "Not Accepted",
        };
      default:
        return {
          bg: "bg-gray-50 text-gray-700 border-gray-200",
          label: status,
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-[#00C800]" />
          <span>BBST Editorial Board • Student Submissions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
          Submit Your Article
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
          Share your research, technical projects, creative essays, or campus stories with Uva
          Wellassa University and the global BBST readership.
        </p>

        {/* Tab Switcher: Submit new vs Track existing */}
        <div className="flex justify-center pt-2">
          <div className="inline-flex p-1 bg-gray-100/90 rounded-2xl border border-gray-200/80">
            <button
              type="button"
              onClick={() => setActiveTab("submit")}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "submit"
                  ? "bg-white text-black shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Submit New Manuscript
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("track")}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "track"
                  ? "bg-white text-black shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Track Existing Submission
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: SUBMIT NEW MANUSCRIPT                             */}
      {/* ======================================================== */}
      {activeTab === "submit" && (
        <>
          {successData ? (
            /* Successful Submission Confirmation Screen */
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-emerald-200 shadow-xl text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
                  Submission Received!
                </h2>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Thank you, <span className="font-semibold text-gray-900">{authorName}</span>. Your
                  article &ldquo;{successData.title}&rdquo; is now safely recorded in our editorial review queue.
                </p>
              </div>

              {/* Reference Card */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                  Your Submission Reference Number
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-mono font-black text-emerald-800 tracking-wider">
                    {successData.submissionRef}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(successData.submissionRef)}
                    className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 pt-1">
                  Keep this code safe. You can use it anytime to check editorial decisions, review
                  feedback, or submit revisions.
                </p>
              </div>

              {/* Explanatory Note */}
              <p className="text-xs text-gray-500 max-w-lg mx-auto">
                <ShieldCheck className="w-4 h-4 text-emerald-600 inline mr-1" />
                Note: Submissions undergo peer review by the BBST editorial team before publication.
                Submitting does not guarantee automatic publication.
              </p>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTrackRef(successData.submissionRef);
                    setActiveTab("track");
                    setSuccessData(null);
                  }}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#171717] hover:bg-black text-white transition-all cursor-pointer"
                >
                  Track This Submission
                </button>
                <Link
                  href="/articles"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all"
                >
                  Explore Published Articles
                </Link>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form
              onSubmit={handleSubmitArticle}
              className="space-y-8 p-6 sm:p-10 rounded-3xl bg-white border border-gray-200/90 shadow-sm"
            >
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs sm:text-sm text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Section 1: Article Identity */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>1. Article Information</span>
                </h3>

                <div className="space-y-1.5">
                  <label htmlFor="sub-title" className="text-xs font-bold text-gray-700">
                    Article Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="sub-title"
                    type="text"
                    required
                    placeholder="e.g. Breakthroughs in Bio-Fertilizers: Sustainable Farming in Badulla"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] focus:border-transparent bg-white text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="sub-category" className="text-xs font-bold text-gray-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="sub-category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] focus:border-transparent bg-white text-gray-900"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="sub-tags" className="text-xs font-bold text-gray-700">
                      Tags (Comma-separated)
                    </label>
                    <input
                      id="sub-tags"
                      type="text"
                      placeholder="e.g. Agriculture, Research, AI, Student Life"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sub-excerpt" className="text-xs font-bold text-gray-700">
                    Summary / Abstract (1-3 sentences)
                  </label>
                  <textarea
                    id="sub-excerpt"
                    rows={2}
                    placeholder="A brief overview summarizing key findings or the narrative hook..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] focus:border-transparent bg-white text-gray-900"
                  />
                </div>
              </div>

              {/* Section 2: Cover Image */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>2. Cover Image (Optional but recommended)</span>
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-gray-50/70 border border-gray-200">
                  {imagePreview ? (
                    <div className="relative w-40 h-28 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
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
                    <div className="w-40 h-28 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 shrink-0 text-center p-2">
                      <Upload className="w-6 h-6 mb-1 text-gray-400" />
                      <span className="text-[10px]">No image selected</span>
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <p className="text-xs text-gray-600">
                      Upload high-resolution photography, diagrams, or artwork (JPEG, PNG, WebP up to 10MB).
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{coverImage ? "Replace Image" : "Choose Image"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 3: Rich Text Content */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
                  3. Full Article Content <span className="text-red-500">*</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Use the toolbar below to format headings, bullet points, quotes, and paragraphs.
                </p>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Begin drafting your article here..."
                />
              </div>

              {/* Section 4: Author Attribution */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
                  4. Author Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="sub-name" className="text-xs font-bold text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="sub-name"
                      type="text"
                      required
                      placeholder="e.g. Kasun Fernando"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] focus:border-transparent bg-white text-gray-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="sub-email" className="text-xs font-bold text-gray-700">
                      University / Contact Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="sub-email"
                      type="email"
                      required
                      placeholder="e.g. kasun@uwu.ac.lk"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] focus:border-transparent bg-white text-gray-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="sub-dept" className="text-xs font-bold text-gray-700">
                      Department / Faculty
                    </label>
                    <input
                      id="sub-dept"
                      type="text"
                      placeholder="e.g. Bio-Systems Technology"
                      value={authorDept}
                      onChange={(e) => setAuthorDept(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Guidelines & Agreement */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-emerald-950 font-medium">
                    I verify that this manuscript is my original work and contains no plagiarism. I
                    grant BBST Magazine permission to review, edit formatting, and publish this
                    article upon editorial board approval.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Editorial decisions are typically communicated within 3–5 business days.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validating & Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit for Editorial Review</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TRACK SUBMISSION & SUBMIT REVISIONS               */}
      {/* ======================================================== */}
      {activeTab === "track" && (
        <div className="space-y-6">
          {/* Tracking Search Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/90 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Track Submission Status</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Enter the unique reference code provided when you submitted your manuscript (e.g.
              BBST-SUB-4A82F1).
            </p>

            <form onSubmit={handleTrackSubmission} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. BBST-SUB-1A2B3C"
                  value={trackRef}
                  onChange={(e) => setTrackRef(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2.5 text-sm font-mono rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
                />
              </div>
              <button
                type="submit"
                disabled={trackingLoading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#171717] hover:bg-black text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {trackingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Lookup Status"}
              </button>
            </form>

            {trackError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                {trackError}
              </div>
            )}
          </div>

          {/* Tracked Submission Details Card */}
          {trackedSubmission && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/90 shadow-sm space-y-6 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-gray-400 block">
                    {trackedSubmission.ref}
                  </span>
                  <h2 className="text-xl font-bold text-[#171717]">{trackedSubmission.title}</h2>
                </div>
                {(() => {
                  const badge = getStatusBadge(trackedSubmission.status);
                  return (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  );
                })()}
              </div>

              {/* Status Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block">Author</span>
                  <span className="font-semibold text-gray-900">{trackedSubmission.authorName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Category</span>
                  <span className="font-semibold text-gray-900">{trackedSubmission.categoryName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Submitted On</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(trackedSubmission.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Last Reviewed</span>
                  <span className="font-semibold text-gray-900">
                    {trackedSubmission.reviewedAt
                      ? new Date(trackedSubmission.reviewedAt).toLocaleDateString()
                      : "Pending review"}
                  </span>
                </div>
              </div>

              {/* Editorial Feedback if Revisions Requested */}
              {trackedSubmission.status === "REVISION_REQUESTED" && (
                <div className="p-5 rounded-2xl bg-orange-50/80 border border-orange-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-900 uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span>Editorial Board Feedback</span>
                  </div>
                  <p className="text-sm text-orange-950 whitespace-pre-wrap leading-relaxed">
                    {trackedSubmission.editorialFeedback}
                  </p>
                  <p className="text-xs text-orange-800">
                    Please revise your article in the section below and click &ldquo;Resubmit
                    Revision&rdquo; to send the updated version back to the review board.
                  </p>
                </div>
              )}

              {/* Live Link if Published */}
              {trackedSubmission.status === "PUBLISHED" && trackedSubmission.slug && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">
                    Congratulations! Your article is live on the BBST website.
                  </span>
                  <Link
                    href={`/articles/${trackedSubmission.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#00E500] text-black hover:bg-[#00D000] transition-colors"
                  >
                    <span>View Published Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Rejection Reason if Rejected */}
              {trackedSubmission.status === "REJECTED" && (
                <div className="p-5 rounded-2xl bg-red-50 border border-red-200 space-y-2">
                  <span className="text-xs font-bold text-red-900 block">Editorial Board Decision</span>
                  <p className="text-xs text-red-800">
                    {trackedSubmission.rejectionReason ||
                      "This submission does not match current publication focus areas. We encourage you to submit new manuscripts in future editions."}
                  </p>
                </div>
              )}

              {/* Workflow C: Revision Resubmission Interface */}
              {trackedSubmission.status === "REVISION_REQUESTED" && (
                <form
                  onSubmit={handleResubmitRevision}
                  className="space-y-4 pt-4 border-t border-gray-100"
                >
                  <h3 className="text-base font-bold text-gray-900">Submit Revised Version</h3>

                  {resubmitSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Revised draft successfully submitted! It is now back under review.</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Revised Title</label>
                    <input
                      type="text"
                      required
                      value={revisedTitle}
                      onChange={(e) => setRevisedTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Revised Content</label>
                    <RichTextEditor
                      content={revisedContent}
                      onChange={setRevisedContent}
                      placeholder="Update your article content based on editorial notes..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {resubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Revision...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Revised Draft</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
