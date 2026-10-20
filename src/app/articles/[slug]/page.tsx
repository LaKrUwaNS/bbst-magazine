import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import { ArticleAuthorCard } from "@/components/articles/article-author-card";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { MOCK_ARTICLES } from "@/data/articles.mock";


type ArticleDetail = Prisma.ArticleGetPayload<{
  include: { author: true; category: true; writer: true };
}>;

export const instant = false;

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let article: ArticleDetail | null = null;
  try {
    article = await prisma.article.findUnique({
      where: { slug },
      include: { author: true, category: true, writer: true },
    });
  } catch (error) {
    console.error("[ArticleDetailPage] Error loading article from database, attempting fallback:", error);
  }

  if (!article) {
    const mock = MOCK_ARTICLES.find((m) => m.slug === slug);
    if (mock) {
      const contentHtml = mock.sections
        .map((s) => `<h3>${s.heading}</h3>${s.content.map((p) => `<p>${p}</p>`).join("")}`)
        .join("");

      article = {
        id: mock.id,
        title: mock.title,
        slug: mock.slug,
        excerpt: mock.excerpt,
        content: contentHtml,
        coverImage: mock.coverImage,
        coverImagePublicId: null,
        status: "published",
        tags: mock.tags ? mock.tags.join(", ") : null,
        isFeatured: Boolean(mock.isEditorPick || mock.isTrending),
        authorName: mock.author.name,
        authorEmail: null,
        authorDept: mock.author.department,
        enteredByEditor: false,
        submissionSource: "Editorial",
        submissionRef: null,
        editorialFeedback: null,
        rejectionReason: null,
        editorialNotes: null,
        reviewedBy: null,
        submittedAt: null,
        reviewedAt: null,
        publishedAt: new Date(mock.publishedAt),
        createdAt: new Date(mock.publishedAt),
        updatedAt: new Date(),
        authorId: mock.author.id,
        writerId: `writer-${mock.author.id}`,
        categoryId: mock.category.id,
        author: {
          id: mock.author.id,
          name: mock.author.name,
          email: `${mock.author.id}@bbst.uwu.ac.lk`,
          emailVerified: true,
          image: mock.author.avatar,
          createdAt: new Date(),
          updatedAt: new Date(),
          role: "EDITOR",
        },
        category: {
          id: mock.category.id,
          name: mock.category.name,
          slug: mock.category.slug,
          description: null,
          iconName: mock.category.iconName || null,
          coverImage: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        writer: {
          id: `writer-${mock.author.id}`,
          name: mock.author.name,
          slug: mock.author.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-"),
          bio: mock.author.bio,
          shortBio: mock.author.bio,
          profileImageUrl: mock.author.avatar,
          department: mock.author.department,
          academicYear: null,
          role: "Student Contributor",
          expertise: mock.tags ? mock.tags.slice(0, 3).join(", ") : null,
          email: null,
          website: null,
          socialLinks: mock.author.socials || {},
          status: "PUBLISHED",
          isFeatured: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as unknown as ArticleDetail;
    }
  }

  if (!article || article.status.toLowerCase() !== "published") {
    notFound();
  }

  const authorName =
    article.writer?.name || article.authorName || article.author?.name || "BBST Contributor";
  const authorAvatar =
    article.writer?.profileImageUrl || article.author?.image || "/images/avatar1.jpg";
  const authorDept =
    article.writer?.department || article.authorDept || "Uva Wellassa University";
  const authorBio =
    article.writer?.shortBio ||
    article.writer?.bio ||
    `${authorName} is an active student researcher and contributor to BBST Magazine.`;
  const authorSocials = (article.writer?.socialLinks as Record<string, string>) || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Return to Articles */}
      <div className="mb-6">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </Link>
      </div>

      <article className="space-y-6">
        {/* Category & Date Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          {article.category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00E500] text-black shadow-2xs">
              <Tag className="w-3 h-3" />
              <span>{article.category.name}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#171717] tracking-tight leading-tight">
          {article.title}
        </h1>

        {/* Author Byline Bar */}
        <div className="flex items-center gap-3 py-3 border-y border-gray-100">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            <Image src={authorAvatar} alt={authorName} fill sizes="40px" className="object-cover" />
          </div>
          <div className="flex flex-col">
            <div className="text-sm font-bold text-gray-900">
              {article.writer ? (
                <Link
                  href={`/writers/${article.writer.slug}`}
                  className="hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
                >
                  <span>By {authorName}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                    Writer Profile
                  </span>
                </Link>
              ) : (
                <span>By {authorName}</span>
              )}
            </div>
            <span className="text-xs text-gray-400">{authorDept}</span>
          </div>
        </div>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-base sm:text-lg text-gray-600 italic font-serif leading-relaxed border-l-4 border-[#00E500] pl-4 my-4">
            &ldquo;{article.excerpt}&rdquo;
          </p>
        )}

        {/* Cover Image */}
        {article.coverImage && (
          <div className="relative w-full h-72 sm:h-96 rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100 border border-gray-100 my-6 shadow-sm">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        {article.content ? (
          <div
            className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800 leading-relaxed pt-2"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <p className="text-gray-500 italic">No content available.</p>
        )}

        {/* Tags */}
        {article.tags && (
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-gray-100">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1">
              Tags:
            </span>
            {article.tags.split(",").map((t: string) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600"
              >
                #{t.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Author Bio Box */}
        <div className="pt-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
            About the Author
          </span>
          <ArticleAuthorCard
            author={{
              id: article.writer?.id || article.authorId || article.id,
              name: authorName,
              slug: article.writer?.slug,
              department: authorDept,
              avatar: authorAvatar,
              bio: authorBio,
              email: article.writer?.email || article.authorEmail || undefined,
              socials: authorSocials,
            }}
          />
        </div>
      </article>
    </div>
  );
}
