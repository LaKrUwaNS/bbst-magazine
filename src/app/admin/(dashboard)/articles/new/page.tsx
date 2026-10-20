import { Metadata } from "next";
import { ArticleEditorForm } from "@/components/admin/article-editor-form";

export const metadata: Metadata = {
  title: "Create Article | BBST Magazine Admin",
};

export const instant = false;

export default function CreateArticlePage() {
  return <ArticleEditorForm />;
}
