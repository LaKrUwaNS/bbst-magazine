import { Suspense } from "react";
import { Metadata } from "next";
import { SubmitArticleForm } from "@/components/articles/submit-article-form";

export const metadata: Metadata = {
  title: "Submit an Article | BBST Student Magazine",
  description:
    "Submit your article, research paper, or essay to the BBST Student Magazine editorial board for review and publication.",
};


export const instant = false;

export default function SubmitArticlePage() {
  return (
    <main className="min-h-screen bg-gray-50/40 py-8">
      <Suspense fallback={<div className="min-h-[500px] flex items-center justify-center text-sm text-gray-500">Loading submission form...</div>}>
        <SubmitArticleForm />
      </Suspense>
    </main>
  );
}
