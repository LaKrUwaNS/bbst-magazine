export type ArticleFilter =
  | "all"
  | "latest"
  | "trending"
  | "editors-picks"
  | "most-read";

export interface ArticleAuthor {
  id: string;
  name: string;
  department: string;
  avatar: string;
  bio: string;
  email?: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
  description?: string;
}

export interface ArticleSection {
  id: string;
  heading: string;
  content: string[]; // array of paragraphs
  quote?: {
    text: string;
    author?: string;
  };
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  titleHighlight?: string; // e.g. "Future of Education" highlighted in green
  excerpt: string;
  coverImage: string;
  category: ArticleCategory;
  author: ArticleAuthor;
  publishedAt: string; // ISO or formatted date e.g. "Sep 28, 2025"
  readTime: string; // e.g. "8 min read"
  tags: string[];
  status: "published" | "draft" | "archived";
  
  // Editorial & Engagement fields (Frontend Mock display fields)
  views?: string; // e.g. "1.2K views"
  readCount?: number;
  trendingScore?: number;
  isEditorPick?: boolean;
  isTrending?: boolean;
  
  // Structured long-form content for modal reader
  sections: ArticleSection[];
}

export interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  count: number;
}
