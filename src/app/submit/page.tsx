import { Suspense } from "react";
import { Metadata } from "next";
import { SubmitArticleForm } from "@/components/articles/submit-article-form";

export const metadata: Metadata = {
  title: "Author Portal & Submission Tracking | BBST Magazine",
  description:
    "Submit your article manuscript or track existing editorial submission status and feedback on the BBST Magazine platform.",
};

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-gray-50/40 py-8">
      <Suspense
        fallback={
          <div className="min-h-125 flex items-center justify-center text-sm text-gray-500">
            Loading author portal &amp; submission desk...
          </div>
        }
      >
        <SubmitArticleForm />
      </Suspense>
    </main>
  );
}
