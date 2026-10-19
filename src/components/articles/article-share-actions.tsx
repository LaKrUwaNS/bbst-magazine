"use client";

import React, { useState } from "react";
import { Link2, Check } from "lucide-react";

interface ArticleShareActionsProps {
  title: string;
  slug: string;
}

export function ArticleShareActions({ title, slug }: ArticleShareActionsProps) {
  const [copied, setCopied] = useState(false);

  const getCanonicalUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/articles/${slug}`;
    }
    return `https://bbstmagazine.com/articles/${slug}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCanonicalUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSocialShare = (platform: "facebook" | "twitter" | "linkedin" | "whatsapp") => {
    const url = encodeURIComponent(getCanonicalUrl());
    const text = encodeURIComponent(title);

    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
        break;
    }

    if (shareUrl && typeof window !== "undefined") {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 my-8">
      <span className="text-xs sm:text-sm font-bold text-gray-800">
        Share this article:
      </span>

      <div className="flex items-center gap-2">
        {/* Facebook */}
        <button
          type="button"
          onClick={() => handleSocialShare("facebook")}
          aria-label="Share on Facebook"
          className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-2xs cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>

        {/* Twitter / X */}
        <button
          type="button"
          onClick={() => handleSocialShare("twitter")}
          aria-label="Share on X"
          className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 transition-transform shadow-2xs cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        {/* LinkedIn */}
        <button
          type="button"
          onClick={() => handleSocialShare("linkedin")}
          aria-label="Share on LinkedIn"
          className="w-8 h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-2xs cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        </button>

        {/* WhatsApp */}
        <button
          type="button"
          onClick={() => handleSocialShare("whatsapp")}
          aria-label="Share on WhatsApp"
          className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-2xs cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
          </svg>
        </button>

        {/* Copy Link button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy canonical article URL"
          className="relative px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-black flex items-center gap-1.5 text-xs font-semibold hover:border-gray-300 transition-colors shadow-2xs cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#00C800]" />
              <span className="text-[#00C800]">Copied!</span>
            </>
          ) : (
            <>
              <Link2 className="w-3.5 h-3.5 text-gray-500" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
