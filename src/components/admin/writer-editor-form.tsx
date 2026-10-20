"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
  X,
  Save,
  Send,
  ExternalLink,
  BookOpen,
  Globe,
} from "lucide-react";

export interface WriterFormInitialData {
  id?: string;
  name?: string;
  slug?: string;
  bio?: string | null;
  shortBio?: string | null;
  profileImageUrl?: string | null;
  profileImagePublicId?: string | null;
  department?: string | null;
  academicYear?: string | null;
  role?: string | null;
  expertise?: string | null;
  email?: string | null;
  website?: string | null;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  } | null;
  status?: string;
  isFeatured?: boolean;
  articles?: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    publishedAt: string | Date | null;
    category?: { name: string } | null;
  }>;
}

interface WriterEditorFormProps {
  initialData?: WriterFormInitialData;
}

export function WriterEditorForm({ initialData }: WriterEditorFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [shortBio, setShortBio] = useState(initialData?.shortBio || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [department, setDepartment] = useState(initialData?.department || "");
  const [academicYear, setAcademicYear] = useState(initialData?.academicYear || "");
  const [role, setRole] = useState(initialData?.role || "");
  const [expertise, setExpertise] = useState(initialData?.expertise || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [website, setWebsite] = useState(initialData?.website || "");

  // Social Links
  const [linkedin, setLinkedin] = useState(initialData?.socialLinks?.linkedin || "");
  const [twitter, setTwitter] = useState(initialData?.socialLinks?.twitter || "");
  const [github, setGithub] = useState(initialData?.socialLinks?.github || "");

  const [status, setStatus] = useState<string>(initialData?.status || "DRAFT");
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(initialData?.isFeatured));

  // Profile image
  const [profileImageUrl, setProfileImageUrl] = useState(initialData?.profileImageUrl || "");
  const [profileImagePublicId, setProfileImagePublicId] = useState(
    initialData?.profileImagePublicId || ""
  );
  const [imagePreview, setImagePreview] = useState(initialData?.profileImageUrl || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status & feedback
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Preview modal
  const [previewOpen, setPreviewOpen] = useState(false);

  // Auto-generate slug when name changes (if not editing or slug is empty)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing || !slug) {
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

  // Profile Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      formData.append("folder", "bbst-magazine/writers");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image.");

      setProfileImageUrl(data.url);
      setProfileImagePublicId(data.publicId || "");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed.";
      setErrorMessage(msg);
      setImagePreview(initialData?.profileImageUrl || "");
      setProfileImageUrl(initialData?.profileImageUrl || "");
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Handler
  const handleSave = async (targetStatus?: string) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim()) {
      setErrorMessage("Writer's full name is required.");
      return;
    }

    if (!shortBio.trim() && !bio.trim()) {
      setErrorMessage("Please provide a short biography or introduction for this writer.");
      return;
    }

    const finalStatus = targetStatus || status;
    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        shortBio: shortBio.trim() || null,
        bio: bio.trim() || null,
        profileImageUrl: profileImageUrl || null,
        profileImagePublicId: profileImagePublicId || null,
        department: department.trim() || null,
        academicYear: academicYear.trim() || null,
        role: role.trim() || null,
        expertise: expertise.trim() || null,
        email: email.trim() || null,
        website: website.trim() || null,
        socialLinks: {
          linkedin: linkedin.trim() || undefined,
          twitter: twitter.trim() || undefined,
          github: github.trim() || undefined,
          website: website.trim() || undefined,
        },
        status: finalStatus,
        isFeatured,
      };

      const url = isEditing
        ? `/api/admin/writers/${initialData?.id}`
        : "/api/admin/writers";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save writer profile.");
      }

      setSuccessMessage(
        isEditing
          ? "Writer profile updated successfully."
          : "Writer profile created successfully."
      );

      if (!isEditing && data.writer?.id) {
        router.push("/admin/writers");
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save writer profile.";
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/writers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Writers</span>
        </Link>

        <div className="flex items-center gap-2">
          {isEditing && slug && status === "PUBLISHED" && (
            <Link
              href={`/writers/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <span>Public Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

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
            <span>{isEditing ? "Update & Publish" : "Publish Profile"}</span>
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
            {isEditing ? "Edit Writer Profile" : "Register New Writer"}
          </span>
          <h1 className="text-2xl font-black text-[#171717] mt-2">
            {isEditing ? `Profile: ${name || "Untitled Writer"}` : "Create Writer Profile"}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Build a comprehensive profile for student authors, researchers, and editorial staff.
          </p>
        </div>

        {/* Section 1: Profile Photo */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Profile Photograph
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm shrink-0">
              {imagePreview ? (
                <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                  <Upload className="w-6 h-6 mb-0.5" />
                  <span className="text-[9px]">No photo</span>
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading to Cloudinary...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{profileImageUrl ? "Change Photograph" : "Upload Photograph"}</span>
                    </>
                  )}
                </button>

                {profileImageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setProfileImageUrl("");
                      setProfileImagePublicId("");
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                Recommended: Square headshot (JPEG, PNG, WebP up to 10MB). A clean SVG avatar is used as fallback.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Core Identity */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Ravindu Senaratne"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Profile URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 text-xs text-gray-400 bg-gray-100 rounded-l-xl border border-r-0 border-gray-200 select-none">
                  /writers/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  placeholder="ravindu-senaratne"
                  className="flex-1 px-3 py-2.5 text-sm font-mono rounded-r-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Role / Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Student Researcher, Contributor"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white text-gray-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Academic Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Dept of Biosystems Technology"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white text-gray-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Academic Year / Batch</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g. 2021/2022 (3rd Year)"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white text-gray-900"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">
              Areas of Expertise / Interests
            </label>
            <input
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="e.g. Microbiology, Agricultural Biotechnology, Renewable Energy"
              className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white text-gray-900"
            />
            <p className="text-[11px] text-gray-400">Comma-separated tags shown on profile cards.</p>
          </div>
        </div>

        {/* Section 3: Biography */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">
              Short Introduction / Card Bio <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              placeholder="1-2 sentences summarizing the writer's focus, displayed on directory cards and article bylines..."
              className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">
              Full Biography (Displayed on individual profile page)
            </label>
            <textarea
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Detailed background, research initiatives, projects, campus achievements, and perspectives..."
              className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E500] bg-white text-gray-900 leading-relaxed"
            />
          </div>
        </div>

        {/* Section 4: Public Contact & Social Links */}
        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Public Contact & Professional Links
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            Only provide information explicitly approved by the writer for public display.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Public Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. contact@example.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Personal Website / Portfolio</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">LinkedIn Profile URL</label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Twitter / X Profile URL</label>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://x.com/username"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-900"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-gray-700">GitHub Profile URL</label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Status and Feature Flags */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">Publication Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none cursor-pointer"
            >
              <option value="DRAFT">Draft (Private)</option>
              <option value="PUBLISHED">Published (Live in Directory)</option>
              <option value="ARCHIVED">Archived (Unlisted)</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Feature this writer in directory spotlight</span>
            </span>
          </label>
        </div>

        {/* Associated Articles Section (When editing) */}
        {isEditing && initialData?.articles && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Associated Articles ({initialData.articles.length})</span>
              </h3>
            </div>

            {initialData.articles.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                No articles are currently linked to this writer profile.
              </p>
            ) : (
              <div className="space-y-2">
                {initialData.articles.map((art) => (
                  <div
                    key={art.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-gray-900 block truncate">{art.title}</span>
                      <span className="text-[10px] text-gray-400">
                        {art.category?.name || "General"} • {art.status}
                      </span>
                    </div>
                    <Link
                      href={`/admin/articles/${art.id}/edit`}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 shrink-0"
                    >
                      Edit Article
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/admin/writers"
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
            <span>{isEditing ? "Save Profile Changes" : "Save & Register Writer"}</span>
          </button>
        </div>
      </div>

      {/* Live Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Directory Card Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-5 space-y-4">
              <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-2xs space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    <Image
                      src={imagePreview || "/images/avatar1.jpg"}
                      alt={name || "Writer"}
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{name || "Writer Full Name"}</h3>
                    <p className="text-xs text-gray-500">
                      {role || "Contributor"} • {department || "Department"}
                    </p>
                    {academicYear && (
                      <span className="text-[11px] text-gray-400 block">{academicYear}</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {shortBio || "Short biography preview will appear here."}
                </p>

                {expertise && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {expertise.split(",").map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800"
                      >
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
