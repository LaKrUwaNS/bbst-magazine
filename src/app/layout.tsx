import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "BBST Magazine",
  description: "A production-oriented digital magazine platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-white text-black`}
    >
      <body className="min-h-full flex flex-col m-0 p-0 font-sans bg-white text-black">
        <header className="border-b border-gray-200 p-4">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="text-xl font-bold text-black no-underline">
              BBST Magazine
            </Link>
            <nav className="flex flex-wrap gap-4 text-sm">
              <Link href="/" className="hover:underline text-black">Home</Link>
              <Link href="/articles" className="hover:underline text-black">Articles</Link>
              <Link href="/magazines" className="hover:underline text-black">Magazine</Link>
              <Link href="/categories" className="hover:underline text-black">Categories</Link>
              <Link href="/events" className="hover:underline text-black">Events</Link>
              <Link href="/about" className="hover:underline text-black">About</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full p-4">
          {children}
        </main>
        <footer className="border-t border-gray-200 p-4 mt-8 text-center text-sm text-gray-500">
          <p>&copy; 2027 BBST Magazine. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
