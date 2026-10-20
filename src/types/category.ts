export type CategorySortOption = "articles" | "name-asc" | "name-desc";

export interface CategoryDetailItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  image: string;
  articleCount: number;
  isFeatured?: boolean;
}

export interface CategoryFiltersState {
  searchQuery: string;
  sortBy: CategorySortOption;
}
