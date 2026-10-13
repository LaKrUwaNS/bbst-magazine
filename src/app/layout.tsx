import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "BBST Magazine | Student Voices for a Brighter Tomorrow",
  description: "Official university student publication dedicated to innovation, research, arts, and campus voices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} h-full antialiased bg-white text-[#171717]`}
    >
      <body className="min-h-full flex flex-col m-0 p-0 font-sans bg-white text-[#171717]">
        <Navbar />
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
        <footer className="border-t border-gray-100 bg-gray-50/60 py-12 text-sm text-gray-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-[#171717]">BBST Magazine</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00]" />
              </div>
              <p className="text-xs text-gray-400">
                Student Voices for a Brighter Tomorrow • University Student Publication
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-gray-600">
              <Link href="/" className="hover:text-black transition-colors">Home</Link>
              <Link href="/articles" className="hover:text-black transition-colors">Articles</Link>
              <Link href="/magazines" className="hover:text-black transition-colors">Magazines</Link>
              <Link href="/categories" className="hover:text-black transition-colors">Categories</Link>
              <Link href="/events" className="hover:text-black transition-colors">Events</Link>
              <Link href="/about" className="hover:text-black transition-colors">About</Link>
            </div>
            <p className="text-xs text-gray-400 text-center md:text-right">
              &copy; 2025 BBST Magazine. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
