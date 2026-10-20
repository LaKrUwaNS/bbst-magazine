import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma, MagazineIssue } from "@prisma/client";
import { HeroSection } from "@/components/hero-section";
import { MagazineIntro } from "@/components/intro/magazine-intro";
import { EditorialScrollExperience } from "@/components/editorial-scroll-experience";
import { SubmitArticleDialog } from "@/components/submit-article-dialog";
import { ArrowRight, BookOpen, FileText, Calendar } from "lucide-react";

type HomeArticle = Prisma.ArticleGetPayload<{
  include: { category: true; author: true; writer: true };
}>;

export const instant = false;

export default async function Home() {
  let recentArticles: HomeArticle[] = [];
  let latestMagazine: MagazineIssue | null = null;
  let publishedArticlesCount = 0;
  let publishedMagazinesCount = 0;
  let usersCount = 0;

  try {
    [
      recentArticles,
      latestMagazine,
      publishedArticlesCount,
      publishedMagazinesCount,
      usersCount,
    ] = await Promise.all([
      prisma.article.findMany({
        where: { status: { in: ["PUBLISHED", "published"] } },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { category: true, author: true, writer: true },
      }),
      prisma.magazineIssue.findFirst({
        where: { status: { in: ["PUBLISHED", "published"] } },
        orderBy: { publicationDate: "desc" },
      }),
      prisma.article.count({
        where: { status: { in: ["PUBLISHED", "published"] } },
      }),
      prisma.magazineIssue.count({
        where: { status: { in: ["PUBLISHED", "published"] } },
      }),
      prisma.user.count(),
    ]);
  } catch (error) {
    console.error("[Home] Failed to load data from database:", error);
  }

  const latestMagazineHref = latestMagazine
    ? `/magazines/${latestMagazine.slug}`
    : "/magazines";

  // Use real counts if available, otherwise display reference platform baseline metrics
  const displayArticlesCount =
    publishedArticlesCount > 0 ? `${publishedArticlesCount}+` : "250+";
  const displayContributorsCount = usersCount > 0 ? `${usersCount}+` : "500+";
  const displayMagazinesCount =
    publishedMagazinesCount > 0 ? `${publishedMagazinesCount}+` : "20+";

  return (
    <div className="relative w-full overflow-x-clip bg-white text-[#171717]">
      {/* Cinematic Magazine Opening Intro Loader */}
      <MagazineIntro />

      {/* ======================================================== */}
      {/* HERO SECTION — Framer Motion Client Component           */}
      {/* ======================================================== */}
      <HeroSection
        latestMagazineHref={latestMagazineHref}
        latestMagazineTitle={latestMagazine?.title ?? null}
        latestMagazineSlug={latestMagazine?.slug ?? null}
        displayArticlesCount={displayArticlesCount}
        displayContributorsCount={displayContributorsCount}
        displayMagazinesCount={displayMagazinesCount}
      />

      {/* ======================================================== */}
      {/* SCROLL-DRIVEN CINEMATIC EDITORIAL EXPERIENCE             */}
      {/* ======================================================== */}
      <EditorialScrollExperience />

      {/* ======================================================== */}
      {/* FEATURED / RECENT ARTICLES SECTION                      */}
      {/* ======================================================== */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00E500]" />
              Editorial Feed
            </div>
            <h2 className="text-3xl font-black text-[#171717] tracking-tight">
              Recent Articles &amp; Research
            </h2>
          </div>
          <Link
            href="/articles"
            className="text-xs font-bold text-gray-900 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>View All Articles</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {recentArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.map((article) => {
              const authorName =
                article.writer?.name ||
                article.authorName ||
                article.author?.name ||
                "BBST Contributor";
              const authorAvatar =
                article.writer?.profileImageUrl ||
                article.author?.image ||
                "/images/avatar1.jpg";
              const coverImg = article.coverImage || "/images/Magazine.png";

              return (
                <article
                  key={article.id}
                  className="group flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white hover:border-[#00E500]/60 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Article Cover Image Container */}
                  <div className="relative w-full h-48 overflow-hidden bg-gray-50">
                    <Image
                      src={coverImg}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    {article.category && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00E500] text-black shadow-xs">
                          {article.category.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-[#171717] group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                        <Link href={`/articles/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h3>
                      {article.excerpt && (
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {article.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <Image
                            src={authorAvatar}
                            alt={authorName}
                            fill
                            sizes="24px"
                            className="object-cover"
                          />
                        </div>
                        <div className="truncate">
                          {article.writer ? (
                            <Link
                              href={`/writers/${article.writer.slug}`}
                              className="font-semibold text-gray-900 hover:text-emerald-700 transition-colors truncate"
                            >
                              {authorName}
                            </Link>
                          ) : (
                            <span className="font-semibold text-gray-900 truncate">
                              {authorName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 text-gray-400">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>
                          {new Date(
                            article.publishedAt || article.createdAt,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Graceful empty state when database has no published articles yet */
          <div className="text-center py-16 px-6 rounded-3xl bg-gray-50/70 border border-dashed border-gray-200 max-w-2xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto text-emerald-700 shadow-2xs">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#171717]">
              No articles published yet
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Our inaugural articles for this semester are currently being
              reviewed. Be the first university contributor to publish your
              research or perspective!
            </p>
            <div className="pt-2">
              <SubmitArticleDialog triggerClassName="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#00E500] hover:bg-[#00D000] text-black transition-all hover:scale-[1.02] shadow-sm cursor-pointer">
                <span>Submit an Article</span>
                <ArrowRight className="w-4 h-4" />
              </SubmitArticleDialog>
            </div>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* LATEST MAGAZINE ISSUE FEATURE SECTION                   */}
      {/* ======================================================== */}
      <section className="py-16 bg-linear-to-b from-gray-50/80 to-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 p-8 sm:p-12 rounded-3xl bg-white border border-gray-200 shadow-sm">
            <div className="space-y-4 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Printed &amp; Digital Magazine
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
                {latestMagazine
                  ? latestMagazine.title
                  : "BBST Student Magazine — Vol 02 / 2025"}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {latestMagazine?.description ||
                  "Featuring university campus innovations, climate adaptation projects, and in-depth student editorial essays on artificial intelligence and sustainable futures."}
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href={latestMagazineHref}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#171717] text-white hover:bg-black font-semibold text-sm transition-all"
                >
                  <BookOpen className="w-4 h-4 text-[#00E500]" />
                  <span>Read Issue Online</span>
                </Link>
                <Link
                  href="/magazines"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-[#171717] font-semibold text-sm transition-all"
                >
                  <span>Archive &amp; Back Issues</span>
                </Link>
              </div>
            </div>

            <div className="w-full max-w-xs flex justify-center">
              <div className="relative w-48 sm:w-56 aspect-3/4 rounded-xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src={latestMagazine?.coverImage || "/images/Magazine.png"}
                  alt={latestMagazine?.title || "Latest Magazine Issue"}
                  fill
                  sizes="224px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
