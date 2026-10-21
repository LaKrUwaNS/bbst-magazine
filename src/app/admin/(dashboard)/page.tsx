import { Metadata } from "next";
import Link from "next/link";
import { getEditorialDashboardStats } from "@/lib/editorial/editorial-service";
import { prisma } from "@/lib/prisma";
import type { MagazineIssue, EditorialActivity } from "@prisma/client";
import { AdminMagazineTable, AdminMagazine } from "@/components/admin/admin-magazine-table";
import {
  Inbox,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  BookOpen,
  Sparkles,
  ArrowRight,
  ExternalLink,
  History,
  PenSquare,
  Calendar,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard Overview | BBST Magazine Admin",
};

export const instant = false;

interface DashboardRecentSubmission {
  id: string;
  title: string;
  authorName: string | null;
  status: string;
  category?: { name: string } | null;
}

export default async function AdminDashboardPage() {
  const stats = await getEditorialDashboardStats();

  let publishedEvents = 0;
  let pendingSuggestions = 0;
  try {
    const [evtCount, sugCount] = await Promise.all([
      prisma.event.count({ where: { publicationStatus: "PUBLISHED" } }),
      prisma.eventSuggestion.count({ where: { status: "PENDING" } }),
    ]);
    publishedEvents = evtCount;
    pendingSuggestions = sugCount;
  } catch (err) {
    console.error("[AdminDashboard] Error loading event metrics:", err);
  }

  let recentMagazines: AdminMagazine[] = [];
  try {
    const rawMags = await prisma.magazineIssue.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
    });
    recentMagazines = rawMags.map((m: MagazineIssue) => ({
      id: m.id,
      title: m.title,
      slug: m.slug,
      edition: m.edition,
      description: m.description,
      coverImage: m.coverImage,
      coverImagePublicId: m.coverImagePublicId,
      pdfAsset: m.pdfAsset,
      pdfAssetPublicId: m.pdfAssetPublicId,
      publicationDate: m.publicationDate ? m.publicationDate.toISOString() : null,
      publicationYear: m.publicationYear,
      isFeatured: m.isFeatured,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));
  } catch (err) {
    console.error("[AdminDashboard] Error loading magazines:", err);
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-emerald-950 via-[#171717] to-black text-white relative overflow-hidden shadow-lg border border-emerald-900/40">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#00FF00]/15 blur-3xl"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-900/60 text-[#00E500] border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              BBST Editorial Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Editorial CMS Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
              Review writer submissions, evaluate revisions, transcribe contributor articles, and
              manage digital magazine editions for Uva Wellassa University.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/admin/submissions"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#00E500] hover:bg-[#00D000] text-black shadow-md shadow-[#00E500]/20 transition-all hover:scale-[1.02]"
            >
              <Inbox className="w-4 h-4" />
              <span>Review Queue ({stats.pendingReviews})</span>
            </Link>

            <Link
              href="/admin/articles/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors"
            >
              <PenSquare className="w-4 h-4" />
              <span>Create Article</span>
            </Link>

            <Link
              href="/articles"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Real Database Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* Metric 1: Pending Reviews */}
        <Link
          href="/admin/submissions?status=SUBMITTED"
          className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:border-emerald-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <Inbox className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Queue
            </span>
          </div>
          <span className="text-2xl font-black text-[#171717] block">
            {stats.pendingReviews}
          </span>
          <span className="text-xs font-bold text-gray-700 block mt-0.5">
            Pending Reviews
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Awaiting editorial review</span>
        </Link>

        {/* Metric 2: Awaiting Revisions */}
        <Link
          href="/admin/submissions?status=REVISION_REQUESTED"
          className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:border-orange-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-700">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
              Revisions
            </span>
          </div>
          <span className="text-2xl font-black text-[#171717] block">
            {stats.awaitingRevisions}
          </span>
          <span className="text-xs font-bold text-gray-700 block mt-0.5">
            With Writers
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Changes requested</span>
        </Link>

        {/* Metric 3: Published Articles */}
        <Link
          href="/admin/articles?status=PUBLISHED"
          className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:border-emerald-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-[#00C800]" />
            </div>
            <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <span className="text-2xl font-black text-[#171717] block">
            {stats.publishedArticles}
          </span>
          <span className="text-xs font-bold text-gray-700 block mt-0.5">
            Published Articles
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Live on website</span>
        </Link>

        {/* Metric 4: Draft Articles */}
        <Link
          href="/admin/articles?status=DRAFT"
          className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:border-gray-400 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
              Draft
            </span>
          </div>
          <span className="text-2xl font-black text-[#171717] block">
            {stats.draftArticles}
          </span>
          <span className="text-xs font-bold text-gray-700 block mt-0.5">
            Draft Articles
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Private preparation</span>
        </Link>

        {/* Metric 5: Total Submissions */}
        <Link
          href="/admin/submissions"
          className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:border-gray-400 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              Total
            </span>
          </div>
          <span className="text-2xl font-black text-[#171717] block">
            {stats.totalSubmissions}
          </span>
          <span className="text-xs font-bold text-gray-700 block mt-0.5">
            Submissions
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Writer submissions</span>
        </Link>

        {/* Metric 6: Published Magazines */}
        <Link
          href="/admin/magazines"
          className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:border-emerald-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800">
              <BookOpen className="w-4 h-4 text-[#00C800]" />
            </div>
            <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              Issues
            </span>
          </div>
          <span className="text-2xl font-black text-[#171717] block">
            {stats.publishedMagazines}
          </span>
          <span className="text-xs font-bold text-gray-700 block mt-0.5">
            Published Issues
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Live editions</span>
        </Link>

        {/* Metric 7: Campus Events */}
        <Link
          href="/admin/events"
          className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:border-emerald-300 transition-all group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800">
              <Calendar className="w-4 h-4 text-[#00C800]" />
            </div>
            <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              Events
            </span>
          </div>
          <span className="text-2xl font-black text-[#171717] block">
            {publishedEvents}
          </span>
          <span className="text-xs font-bold text-gray-700 block mt-0.5">
            Campus Events
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">
            {pendingSuggestions > 0 ? `${pendingSuggestions} pending proposals` : "Live schedule"}
          </span>
        </Link>
      </div>

      {/* Two-Column Section: Recent Submissions & Editorial Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Recent Submissions Queue Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-emerald-700" />
              <h2 className="text-base font-bold text-[#171717]">Pending Submissions</h2>
            </div>
            <Link
              href="/admin/submissions"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.recentSubmissions.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No submissions recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {stats.recentSubmissions.map((sub: DashboardRecentSubmission) => (
                <div
                  key={sub.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs group"
                >
                  <div className="min-w-0 space-y-0.5">
                    <Link
                      href={`/admin/submissions/${sub.id}`}
                      className="font-bold text-gray-900 hover:text-emerald-700 transition-colors block truncate"
                    >
                      {sub.title}
                    </Link>
                    <span className="text-[11px] text-gray-400 block">
                      By {sub.authorName || "Writer"} • {sub.category?.name || "General"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                      {sub.status}
                    </span>
                    <Link
                      href={`/admin/submissions/${sub.id}`}
                      className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Editorial Activity Log (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <History className="w-4 h-4 text-emerald-700" />
            <h2 className="text-base font-bold text-[#171717]">Editorial Activity Log</h2>
          </div>

          {stats.recentActivity.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No actions logged yet. Editorial operations will record here automatically.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((log: EditorialActivity) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{log.action.replace("_", " ")}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 truncate">{log.entityTitle || log.details}</p>
                  <span className="text-[10px] text-emerald-800 font-semibold block">
                    By {log.performedBy}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Magazine Publications Section with Popup Modal Dialog */}
      <AdminMagazineTable
        initialMagazines={recentMagazines}
        title="Magazine Editions"
        subtitle="Manage official digital issues, upload PDFs and covers via popup forms, and publish."
      />
    </div>
  );
}
