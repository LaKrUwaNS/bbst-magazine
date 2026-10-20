"use client";

import * as React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, FileText, Info, Loader2, Copy, Check } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface SubmitArticleDialogProps {
  children?: React.ReactNode;
  triggerClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SubmitArticleDialog({
  children,
  triggerClassName,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: SubmitArticleDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [submissionRef, setSubmissionRef] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [categories, setCategories] = React.useState<CategoryOption[]>([]);

  const [formData, setFormData] = React.useState({
    title: "",
    author: "",
    department: "",
    email: "",
    categoryId: "",
    abstract: "",
    content: "",
    draftUrl: "",
    agreeTerms: true,
  });

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? setControlledOpen : setInternalOpen;

  React.useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
          setFormData((prev) => ({
            ...prev,
            categoryId: prev.categoryId || data.categories[0].id,
          }));
        }
      } catch (err) {
        console.error("Failed to load categories for submission dialog:", err);
      }
    }
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.title.trim() || !formData.author.trim() || !formData.email.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    // Build editorial content payload (at least 50 characters required by backend)
    let fullContent = formData.content.trim();
    if (!fullContent) {
      if (formData.abstract.trim()) {
        fullContent = `<p>${formData.abstract.trim()}</p>`;
      }
      if (formData.draftUrl.trim()) {
        fullContent += `<p><strong>Manuscript Link:</strong> <a href="${formData.draftUrl.trim()}" target="_blank" rel="noopener noreferrer">${formData.draftUrl.trim()}</a></p>`;
      }
    } else if (formData.draftUrl.trim()) {
      fullContent += `<p><strong>Manuscript Link:</strong> <a href="${formData.draftUrl.trim()}" target="_blank" rel="noopener noreferrer">${formData.draftUrl.trim()}</a></p>`;
    }

    if (fullContent.replace(/<[^>]*>/g, "").trim().length < 50) {
      setErrorMessage("Please provide at least 50 characters in the article content or summary.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/articles/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          excerpt: formData.abstract.trim() || undefined,
          content: fullContent,
          authorName: formData.author.trim(),
          authorEmail: formData.email.trim(),
          authorDept: formData.department.trim() || undefined,
          categoryId: formData.categoryId || undefined,
          agreeTerms: formData.agreeTerms,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to submit article.");
      }

      setSubmissionRef(result.submissionRef || "BBST-SUBMISSION");
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = () => {
    if (submissionRef) {
      navigator.clipboard.writeText(submissionRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmissionRef("");
    setErrorMessage("");
    setFormData({
      title: "",
      author: "",
      department: "",
      email: "",
      categoryId: categories[0]?.id || "",
      abstract: "",
      content: "",
      draftUrl: "",
      agreeTerms: true,
    });
    setIsOpen?.(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {React.isValidElement(children) && (children.type === "button" || (typeof children.type === "string" && children.type.toLowerCase() === "button")) ? (
        <DialogTrigger render={children as React.ReactElement} />
      ) : children ? (
        <DialogTrigger className={triggerClassName}>
          {children}
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white p-6 rounded-2xl shadow-2xl border border-gray-100">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#166534] bg-emerald-50 px-3 py-1 rounded-full w-fit">
            <FileText className="w-3.5 h-3.5 text-[#15803d]" />
            BBST Editorial Board Submissions
          </div>
          <DialogTitle className="text-2xl font-bold text-[#171717]">
            Submit Your Article
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            Share your voice, discoveries, and university projects with fellow students and faculty.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#171717]">
              Submission Received!
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Thank you, <span className="font-semibold text-gray-900">{formData.author}</span>.
              Your article draft &ldquo;{formData.title}&rdquo; has been queued for editorial review.
            </p>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 max-w-sm mx-auto text-center space-y-1">
              <div className="text-xs font-medium text-emerald-800 uppercase tracking-wider">
                Submission Reference
              </div>
              <div className="flex items-center justify-center gap-2 font-mono font-bold text-lg text-emerald-950">
                <span>{submissionRef}</span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="p-1 hover:bg-emerald-100 rounded text-emerald-800 transition"
                  title="Copy reference code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-emerald-700">Save this code to track your submission status.</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/submit-article"
                onClick={() => setIsOpen?.(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-center"
              >
                Track in Submissions Portal
              </Link>
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs text-gray-700 border-gray-300"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {errorMessage && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {errorMessage}
              </div>
            )}

            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex items-start gap-3 text-xs text-emerald-800">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Editorial Guidelines:</p>
                <p>Manuscripts typically range 800–2,500 words. Peer-reviewed research, op-eds, interviews, and student life pieces are all welcome.</p>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="dialog-article-title" className="text-xs font-semibold text-gray-700">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                id="dialog-article-title"
                required
                type="text"
                placeholder="e.g. Next-Generation Renewable Energy on Campus"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent bg-white text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="dialog-author-name" className="text-xs font-semibold text-gray-700">
                  Author Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="dialog-author-name"
                  required
                  type="text"
                  placeholder="Your full name"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent bg-white text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="dialog-author-email" className="text-xs font-semibold text-gray-700">
                  Student Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="dialog-author-email"
                  required
                  type="email"
                  placeholder="student@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent bg-white text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="dialog-author-dept" className="text-xs font-semibold text-gray-700">
                  Department / Major
                </label>
                <input
                  id="dialog-author-dept"
                  type="text"
                  placeholder="e.g. Computer Science & AI"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent bg-white text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="dialog-article-category" className="text-xs font-semibold text-gray-700">
                  Category
                </label>
                <select
                  id="dialog-article-category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent bg-white text-gray-900"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="dialog-article-abstract" className="text-xs font-semibold text-gray-700">
                Abstract / Excerpt
              </label>
              <textarea
                id="dialog-article-abstract"
                rows={2}
                placeholder="Brief summary of your article or story..."
                value={formData.abstract}
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent bg-white text-gray-900"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="dialog-article-content" className="text-xs font-semibold text-gray-700">
                Article Content / Draft Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                id="dialog-article-content"
                required
                rows={4}
                placeholder="Write your article draft or provide complete draft text here (minimum 50 characters)..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent bg-white text-gray-900"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="dialog-article-link" className="text-xs font-semibold text-gray-700">
                Manuscript Link (Optional Google Doc, Notion, or Cloud storage)
              </label>
              <input
                id="dialog-article-link"
                type="url"
                placeholder="https://docs.google.com/..."
                value={formData.draftUrl}
                onChange={(e) => setFormData({ ...formData, draftUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent bg-white text-gray-900"
              />
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-gray-400">
                Direct questions? <a href="mailto:contact@bbstmagazine.example.com" className="text-emerald-700 underline">contact@bbstmagazine</a>
              </p>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#171717] hover:bg-black text-white px-5 py-2 rounded-xl flex items-center gap-2 group transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Manuscript</span>
                    <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
