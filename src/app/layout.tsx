import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
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
import { PublicFooter } from "@/components/public-footer";

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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} h-full antialiased bg-white text-[#171717]`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col m-0 p-0 font-sans bg-white text-[#171717]"
      >
        <Navbar />
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
        <PublicFooter />
      </body>
    </html>
  );
}
