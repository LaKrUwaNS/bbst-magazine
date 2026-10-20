"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Globe, ArrowRight } from "lucide-react";
import { ArticleAuthor } from "@/types/article";

interface ArticleAuthorCardProps {
  author: ArticleAuthor;
}

export function ArticleAuthorCard({ author }: ArticleAuthorCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gray-50/70 border border-gray-100 my-6">
      <div className="flex items-start gap-4 min-w-0">
        {/* Avatar */}
        {author.slug ? (
          <Link
            href={`/writers/${author.slug}`}
            className="relative w-13 h-13 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-white shadow-2xs hover:ring-2 hover:ring-[#00C800] transition-all"
          >
            <Image
              src={author.avatar}
              alt={author.name}
              fill
              sizes="52px"
              className="object-cover"
            />
          </Link>
        ) : (
          <div className="relative w-13 h-13 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-white shadow-2xs">
            <Image
              src={author.avatar}
              alt={author.name}
              fill
              sizes="52px"
              className="object-cover"
            />
          </div>
        )}

        {/* Info */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-2">
            {author.slug ? (
              <Link
                href={`/writers/${author.slug}`}
                className="font-bold text-sm sm:text-base text-[#171717] hover:text-[#00A800] transition-colors truncate"
              >
                {author.name}
              </Link>
            ) : (
              <h4 className="font-bold text-sm sm:text-base text-[#171717] truncate">
                {author.name}
              </h4>
            )}
          </div>
          <span className="text-xs text-gray-400 mb-1.5">
            {author.department}
          </span>
          <p className="text-xs text-gray-600 leading-relaxed max-w-lg">
            {author.bio}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0">
        {author.slug ? (
          <Link
            href={`/writers/${author.slug}`}
            className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:text-black hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>View Profile</span>
            <ArrowRight className="w-3 h-3 text-[#00C800]" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setIsFollowing((prev) => !prev)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isFollowing
                ? "bg-[#00E500] text-[#171717] font-bold"
                : "bg-white border border-gray-200 text-gray-700 hover:text-black hover:border-gray-300"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}

        {/* Social Icons */}
        <div className="flex items-center gap-2 text-gray-400">
          {author.socials?.linkedin && (
            <a
              href={author.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${author.name} LinkedIn`}
              className="hover:text-blue-600 transition-colors p-1"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          )}
          {author.email && (
            <a
              href={`mailto:${author.email}`}
              aria-label={`Email ${author.name}`}
              className="hover:text-black transition-colors p-1"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          )}
          {author.socials?.website && (
            <a
              href={author.socials.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${author.name} Website`}
              className="hover:text-black transition-colors p-1"
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
