"use client";

import * as React from "react";
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
import { Send, CheckCircle2, FileText, Info } from "lucide-react";

const CATEGORIES = [
  "Science & Research",
  "Agriculture & Environment",
  "Technology & Innovation",
  "Business & Entrepreneurship",
  "Education & Career",
  "Society & Culture",
  "Arts & Literature",
  "Interviews & Opinions",
  "University Life & Achievements",
  "Projects & Inventions",
];

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
  const [formData, setFormData] = React.useState({
    title: "",
    author: "",
    department: "",
    email: "",
    category: CATEGORIES[0],
    abstract: "",
    draftUrl: "",
  });

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? setControlledOpen : setInternalOpen;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.email) {
      return;
    }
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      title: "",
      author: "",
      department: "",
      email: "",
      category: CATEGORIES[0],
      abstract: "",
      draftUrl: "",
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
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#171717]">
              Submission Received!
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Thank you, <span className="font-semibold text-gray-900">{formData.author}</span>.
              Your article draft &ldquo;{formData.title}&rdquo; has been queued for editorial review.
              Our board will reach out to <span className="font-semibold text-gray-900">{formData.email}</span> within 5–7 business days.
            </p>
            <div className="pt-4">
              <Button
                onClick={handleReset}
                className="bg-[#171717] hover:bg-black text-white px-6 rounded-full"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex items-start gap-3 text-xs text-emerald-800">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Editorial Guidelines:</p>
                <p>Manuscripts typically range 800–2,500 words. Peer-reviewed research, op-eds, interviews, and student life pieces are all welcome.</p>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="article-title" className="text-xs font-semibold text-gray-700">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                id="article-title"
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
                <label htmlFor="author-name" className="text-xs font-semibold text-gray-700">
                  Author Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="author-name"
                  required
                  type="text"
                  placeholder="Your full name"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent bg-white text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="author-email" className="text-xs font-semibold text-gray-700">
                  Student Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="author-email"
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
                <label htmlFor="author-dept" className="text-xs font-semibold text-gray-700">
                  Department / Major
                </label>
                <input
                  id="author-dept"
                  type="text"
                  placeholder="e.g. Computer Science & AI"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent bg-white text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="article-category" className="text-xs font-semibold text-gray-700">
                  Category
                </label>
                <select
                  id="article-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent bg-white text-gray-900"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="article-abstract" className="text-xs font-semibold text-gray-700">
                Abstract / Excerpt
              </label>
              <textarea
                id="article-abstract"
                rows={3}
                placeholder="Brief summary of your article or story..."
                value={formData.abstract}
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent bg-white text-gray-900"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="article-link" className="text-xs font-semibold text-gray-700">
                Manuscript Link (Google Doc, Notion, or Cloud storage)
              </label>
              <input
                id="article-link"
                type="url"
                placeholder="https://docs.google.com/..."
                value={formData.draftUrl}
                onChange={(e) => setFormData({ ...formData, draftUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent bg-white text-gray-900"
              />
            </div>

            <DialogFooter className="pt-2 flex flex-row items-center justify-between gap-3">
              <p className="text-xs text-gray-400">
                Direct questions? <a href="mailto:contact@bbstmagazine.example.com" className="text-emerald-700 underline">contact@bbstmagazine</a>
              </p>
              <Button
                type="submit"
                className="bg-[#171717] hover:bg-black text-white px-5 py-2 rounded-xl flex items-center gap-2 group transition-all"
              >
                <span>Submit Manuscript</span>
                <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
