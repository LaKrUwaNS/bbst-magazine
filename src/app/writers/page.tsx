import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { WritersDirectory, PublicWriter } from "@/components/writers/writers-directory";
import { FALLBACK_WRITERS } from "@/data/writers.data";

export const metadata: Metadata = {
  title: "Meet Our Writers | BBST Student Magazine",
  description:
    "Discover the student researchers, writers, and contributors shaping BBST Magazine at Uva Wellassa University.",
};

interface RawWriterDirectoryItem {
  id: string;
  name: string;
  slug: string;
  shortBio: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  department: string | null;
  academicYear: string | null;
  role: string | null;
  expertise: string | null;
  socialLinks: unknown;
  website: string | null;
  isFeatured: boolean;
  _count: {
    articles: number;
  };
}

export const instant = false;

export default async function WritersPage() {
  let writers: PublicWriter[] = [];

  try {
    const rawWriters = await prisma.writerProfile.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        shortBio: true,
        bio: true,
        profileImageUrl: true,
        department: true,
        academicYear: true,
        role: true,
        expertise: true,
        socialLinks: true,
        website: true,
        isFeatured: true,
        _count: {
          select: {
            articles: {
              where: {
                status: { in: ["PUBLISHED", "published"] },
              },
            },
          },
        },
      },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    });

    if (rawWriters.length > 0) {
      writers = rawWriters.map((w: RawWriterDirectoryItem) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        shortBio: w.shortBio || w.bio?.slice(0, 160) || "",
        profileImageUrl: w.profileImageUrl || "/images/avatar1.jpg",
        department: w.department || "BBST Department",
        academicYear: w.academicYear,
        role: w.role || "Contributor",
        expertise: w.expertise ? w.expertise.split(",").map((e: string) => e.trim()).filter(Boolean) : [],
        socialLinks: (w.socialLinks as Record<string, string>) || {},
        website: w.website,
        isFeatured: w.isFeatured,
        publishedArticlesCount: w._count.articles,
      }));
    } else {
      writers = [...FALLBACK_WRITERS];
    }
  } catch (error) {
    console.error("[WritersPage] Database query failed or timed out, falling back to curated writers:", error);
    writers = [...FALLBACK_WRITERS];
  }

  const departmentsSet = new Set<string>();
  writers.forEach((w: PublicWriter) => {
    if (w.department) departmentsSet.add(w.department);
  });
  const departments = Array.from(departmentsSet).sort();

  return <WritersDirectory initialWriters={writers} initialDepartments={departments} />;
}
