export type MagazineCategory =
  | "all"
  | "research-tech"
  | "agriculture-environment"
  | "campus-culture"
  | "special-edition";

export type MagazineSortOption = "newest" | "oldest" | "title";

export interface MagazinePagePreview {
  pageNumber: number;
  title: string;
  excerpt?: string;
  image?: string;
}

export interface MagazineIssueItem {
  id: string;
  title: string;
  slug: string;
  edition: string; // e.g. "Volume 02 • Issue 01"
  volume: string; // "Vol. 02"
  issueNumber: number;
  year: number;
  category: MagazineCategory;
  categoryLabel: string;
  description: string;
  coverImage: string;
  pdfAsset: string;
  publicationDate: string; // ISO date string
  pageCount: number;
  fileSize: string; // e.g. "14.5 MB"
  isFeatured?: boolean;
  highlights: string[]; // key article topics inside
  pages?: MagazinePagePreview[];
  status: "published" | "draft" | "archived";
}

export interface MagazineFiltersState {
  searchQuery: string;
  selectedCategory: MagazineCategory;
  selectedYear: string; // "all" | "2025" | "2024" | "2023"
  sortBy: MagazineSortOption;
}
