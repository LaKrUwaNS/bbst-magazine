import { prisma } from "@/lib/prisma";
import { BBST_MAGAZINES } from "@/data/magazines.data";
import {
  MagazineIssueItem,
  MagazineCategory,
  MagazineSortOption,
} from "@/types/magazine";

export interface GetMagazinesOptions {
  query?: string;
  category?: MagazineCategory;
  year?: string;
  sortBy?: MagazineSortOption;
}

/**
 * Normalizes a database MagazineIssue or curated magazine item into a consistent MagazineIssueItem.
 */
function mergeWithCuratedData(dbIssue: {
  id: string;
  title: string;
  slug: string;
  edition?: string | null;
  description: string | null;
  coverImage: string | null;
  pdfAsset: string | null;
  publicationDate: Date | null;
  publicationYear?: number | null;
  isFeatured?: boolean;
  status: string;
}): MagazineIssueItem {
  const curated = BBST_MAGAZINES.find(
    (m) => m.slug === dbIssue.slug || m.id === dbIssue.id
  );

  const publicationDateStr = dbIssue.publicationDate
    ? dbIssue.publicationDate.toISOString()
    : curated?.publicationDate || new Date().toISOString();

  const parsedYear = dbIssue.publicationYear
    ? dbIssue.publicationYear
    : dbIssue.publicationDate
    ? new Date(dbIssue.publicationDate).getFullYear()
    : curated?.year || new Date().getFullYear();

  return {
    id: dbIssue.id,
    title: dbIssue.title || curated?.title || "BBST Student Magazine",
    slug: dbIssue.slug,
    edition: dbIssue.edition || curated?.edition || `Volume ${parsedYear}`,
    volume: curated?.volume || "Vol. 02",
    issueNumber: curated?.issueNumber || 1,
    year: parsedYear,
    category: curated?.category || "research-tech",
    categoryLabel: curated?.categoryLabel || "Research & Innovation",
    description:
      dbIssue.description ||
      curated?.description ||
      "Student publications and research from Uva Wellassa University.",
    coverImage:
      dbIssue.coverImage || curated?.coverImage || "/images/Magazine.png",
    pdfAsset:
      dbIssue.pdfAsset ||
      curated?.pdfAsset ||
      "/assets/magazines/bbst-magazine-vol-02-2025.pdf",
    publicationDate: publicationDateStr,
    pageCount: curated?.pageCount || 56,
    fileSize: curated?.fileSize || "12.0 MB",
    isFeatured: dbIssue.isFeatured !== undefined ? Boolean(dbIssue.isFeatured) : (curated?.isFeatured ?? false),
    highlights: curated?.highlights || [
      "Student research & engineering prototypes",
      "Biosystems innovations and field reports",
      "Interviews with faculty and alumni mentors",
    ],
    pages: curated?.pages,
    status: (dbIssue.status.toLowerCase() as "published" | "draft" | "archived") || "published",
  };
}

export class MagazineRepository {
  /**
   * Fetches published magazine issues with optional in-memory / SQL filtering and sorting.
   */
  async getMagazines(options?: GetMagazinesOptions): Promise<MagazineIssueItem[]> {
    let items: MagazineIssueItem[] = [];

    try {
      const dbIssues = await prisma.magazineIssue.findMany({
        where: { status: { in: ["published", "PUBLISHED"] } },
        orderBy: { publicationDate: "desc" },
      });

      if (dbIssues.length > 0) {
        items = dbIssues.map(mergeWithCuratedData);
      } else {
        items = [...BBST_MAGAZINES];
      }
    } catch (error) {
      console.error("[MagazineRepository] Error fetching from database, falling back to curated collection:", error);
      items = [...BBST_MAGAZINES];
    }

    // Apply filtering
    if (options?.query) {
      const q = options.query.toLowerCase().trim();
      items = items.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.edition.toLowerCase().includes(q) ||
          m.highlights.some((h) => h.toLowerCase().includes(q))
      );
    }

    if (options?.category && options.category !== "all") {
      items = items.filter((m) => m.category === options.category);
    }

    if (options?.year && options.year !== "all") {
      const yearNum = parseInt(options.year, 10);
      if (!isNaN(yearNum)) {
        items = items.filter((m) => m.year === yearNum);
      }
    }

    // Apply sorting
    if (options?.sortBy) {
      switch (options.sortBy) {
        case "newest":
          items.sort(
            (a, b) =>
              new Date(b.publicationDate).getTime() -
              new Date(a.publicationDate).getTime()
          );
          break;
        case "oldest":
          items.sort(
            (a, b) =>
              new Date(a.publicationDate).getTime() -
              new Date(b.publicationDate).getTime()
          );
          break;
        case "title":
          items.sort((a, b) => a.title.localeCompare(b.title));
          break;
      }
    }

    return items;
  }

  /**
   * Finds a magazine issue by its unique slug.
   */
  async getMagazineBySlug(slug: string): Promise<MagazineIssueItem | null> {
    try {
      const dbIssue = await prisma.magazineIssue.findUnique({
        where: { slug },
      });

      if (dbIssue && (dbIssue.status === "published" || dbIssue.status === "PUBLISHED")) {
        return mergeWithCuratedData(dbIssue);
      }
    } catch (error) {
      console.error(`[MagazineRepository] Error querying slug ${slug}:`, error);
    }

    // Fallback search in curated collection
    const curated = BBST_MAGAZINES.find((m) => m.slug === slug);
    return curated || null;
  }

  /**
   * Retrieves the featured magazine (or the most recent publication).
   */
  async getFeaturedMagazine(): Promise<MagazineIssueItem | null> {
    const all = await this.getMagazines({ sortBy: "newest" });
    const featured = all.find((m) => m.isFeatured);
    return featured || all[0] || null;
  }
}

export const magazineRepository = new MagazineRepository();
