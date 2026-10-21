import { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";
import {
  Mail,
  MapPin,
  BookOpen,
  Clock,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Editorial Desk — BBST Magazine",
  description:
    "Direct correspondence desk for BBST Magazine. Connect with editors, track manuscripts, or inquire about publication editions.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb / Intro */}
        <div className="mb-10 sm:mb-14 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[#00873D] text-xs font-bold tracking-wide uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E500]" />
            Official Correspondence Desk
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight leading-tight">
            Connect With the <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#171717] via-gray-800 to-[#00A84D]">
              Editorial Board.
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
            Have questions regarding upcoming calls for papers, print magazine
            distributions, or academic article submissions? Reach out directly
            to our publishing board.
          </p>
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          {/* Left Column: Contact Details, FAQ, Fast Actions */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Contact Info Card */}
            <div className="bg-[#171717] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E500]/10 rounded-full blur-2xl pointer-events-none" />
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span>Editorial Headquarters</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E500]" />
              </h2>

              <div className="space-y-5 text-sm text-gray-300">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-[#00E500] mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
                      Direct Email
                    </div>
                    <a
                      href="mailto:ceylonnest.org@gmail.com"
                      className="text-white hover:text-[#00E500] transition-colors font-medium break-all"
                    >
                      ceylonnest.org@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-[#00E500] mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
                      Academic Affiliation
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                      Faculty of Technological Studies,
                      <br />
                      Uva Wellassa University of Sri Lanka,
                      <br />
                      Passara Road, Badulla 90000.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-[#00E500] mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
                      Review Hours
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm">
                      Monday &ndash; Friday: 08:30 &ndash; 16:30 IST
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-[#171717] uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Fast Resources</span>
              </h2>

              <ul className="space-y-3 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/submit"
                    className="flex items-center justify-between text-gray-700 hover:text-black hover:font-medium group transition-all"
                  >
                    <span>Submit a New Article Draft</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#00A84D] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/submit?track=1"
                    className="flex items-center justify-between text-gray-700 hover:text-black hover:font-medium group transition-all"
                  >
                    <span>Track Submission by Reference</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#00A84D] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/magazines"
                    className="flex items-center justify-between text-gray-700 hover:text-black hover:font-medium group transition-all"
                  >
                    <span>Explore Digital Magazine Editions</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#00A84D] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/writers"
                    className="flex items-center justify-between text-gray-700 hover:text-black hover:font-medium group transition-all"
                  >
                    <span>Browse Registered Writers Directory</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#00A84D] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Security Assurance Badge */}
            <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-4 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#00873D] shrink-0" />
              <div className="text-xs text-gray-600">
                <strong className="text-gray-900 font-semibold">
                  Verified Sender Security
                </strong>
                : All correspondence is processed with automated DKIM &amp; SPF
                compliant Gmail SMTP transport.
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
