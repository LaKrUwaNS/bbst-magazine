import { Metadata } from "next";
import Link from "next/link";
import { Calendar, Sparkles, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Events & Workshops | BBST Student Magazine",
  description:
    "Discover upcoming webinars, student research symposiums, and editorial workshops organized by BBST Student Magazine of Uva Wellassa University.",
};

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-[#00C800]" />
            <span>Community & Academic Calendar</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
            Upcoming Events &amp; Workshops
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Join the BBST editorial community for webinars, student research presentations, and writing masterclasses at Uva Wellassa University.
          </p>
        </div>

        <div className="p-8 sm:p-12 border border-gray-200 rounded-3xl bg-gray-50/70 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto text-emerald-700 shadow-2xs">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">Next Event Calendar Underway</h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              Our editorial board is preparing upcoming workshop dates for student writers, scientific illustrators, and biosystems innovators.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-[#171717] hover:bg-black text-white transition-all"
            >
              Explore Published Articles
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
