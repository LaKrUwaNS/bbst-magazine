import { Metadata } from "next";
import { ArticlesView } from "@/components/articles/articles-view";

export const metadata: Metadata = {
  title: "All Articles | BBST Student Magazine",
  description:
    "Explore stories, research, ideas and perspectives from the BBST student community.",
};

export const instant = false;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  return <ArticlesView initialCategory={category} initialQuery={q} />;
}
