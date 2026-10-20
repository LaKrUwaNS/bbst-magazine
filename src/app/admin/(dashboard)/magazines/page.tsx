import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { MagazineIssue } from "@prisma/client";
import { AdminMagazineTable, AdminMagazine } from "@/components/admin/admin-magazine-table";

export const metadata: Metadata = {
  title: "Manage Magazines | BBST Magazine Admin",
};


export const instant = false;

export default async function AdminMagazinesPage() {
  let magazines: AdminMagazine[] = [];

  try {
    const dbIssues = await prisma.magazineIssue.findMany({
      orderBy: { updatedAt: "desc" },
    });

    magazines = dbIssues.map((m: MagazineIssue) => ({
      id: m.id,
      title: m.title,
      slug: m.slug,
      description: m.description,
      coverImage: m.coverImage,
      pdfAsset: m.pdfAsset,
      publicationDate: m.publicationDate ? m.publicationDate.toISOString() : null,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("[AdminMagazinesPage] Failed to fetch magazines:", error);
  }

  return (
    <div className="space-y-6">
      <AdminMagazineTable
        initialMagazines={magazines}
        showFilters={true}
        title="Manage All Magazines"
        subtitle="Search across all publications, filter by status, update metadata, replace files, and manage live publishing."
      />
    </div>
  );
}
