import { Metadata } from "next";
import { categoryRepository } from "@/lib/categories/category-repository";
import { CategoriesView } from "@/components/categories/categories-view";

export const metadata: Metadata = {
  title: "Explore Categories | BBST Student Magazine",
  description:
    "Discover ideas, stories, research, and creative work from the BBST student community across science, technology, agriculture, and campus life.",
};


export const instant = false;

export default async function CategoriesPage() {
  const categories = await categoryRepository.getCategories({
    sortBy: "articles",
  });

  return <CategoriesView initialCategories={categories} />;
}
