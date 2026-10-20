import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WriterProfileView, WriterDetailData } from "@/components/writers/writer-profile-view";
import { getFallbackWriterBySlug } from "@/data/writers.data";

interface RawWriterArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  let writer: {
    name: string;
    role: string | null;
    department: string | null;
    shortBio: string | null;
    bio: string | null;
    profileImageUrl: string | null;
  } | null = null;

  try {
    writer = await prisma.writerProfile.findFirst({
      where: {
        slug: { equals: slug, mode: "insensitive" },
        status: "PUBLISHED",
      },
      select: {
        name: true,
        role: true,
        department: true,
        shortBio: true,
        bio: true,
        profileImageUrl: true,
      },
    });
  } catch (err) {
    console.error(`[generateMetadata] Error loading writer slug ${slug}:`, err);
  }

  if (!writer) {
    const fallback = getFallbackWriterBySlug(slug);
    if (fallback) {
      writer = {
        name: fallback.name,
        role: fallback.role,
        department: fallback.department,
        shortBio: fallback.shortBio,
        bio: fallback.bio,
        profileImageUrl: fallback.profileImageUrl,
      };
    }
  }

  if (!writer) {
    return {
      title: "Writer Profile | BBST Student Magazine",
    };
  }

  const desc =
    writer.shortBio ||
    writer.bio?.slice(0, 160) ||
    `Read articles, research, and perspectives by ${writer.name} on BBST Student Magazine.`;

  return {
    title: `${writer.name} | BBST Student Magazine`,
    description: desc,
    openGraph: {
      title: `${writer.name} | BBST Magazine Writer`,
      description: desc,
      images: writer.profileImageUrl ? [{ url: writer.profileImageUrl }] : undefined,
    },
  };
}

export const instant = false;

export default async function WriterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let rawWriter = null;
  try {
    rawWriter = await prisma.writerProfile.findFirst({
      where: {
        slug: { equals: slug, mode: "insensitive" },
        status: "PUBLISHED",
      },
      include: {
        articles: {
          where: {
            status: { in: ["PUBLISHED", "published"] },
          },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            publishedAt: true,
            createdAt: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: { publishedAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error(`[WriterDetailPage] Error loading writer ${slug} from DB:`, error);
  }

  if (!rawWriter) {
    const fallback = getFallbackWriterBySlug(slug);
    if (!fallback) {
      notFound();
    }
    return <WriterProfileView writer={fallback} />;
  }

  const writer: WriterDetailData = {
    id: rawWriter.id,
    name: rawWriter.name,
    slug: rawWriter.slug,
    bio: rawWriter.bio || "",
    shortBio: rawWriter.shortBio || "",
    profileImageUrl: rawWriter.profileImageUrl || "/images/avatar1.jpg",
    department: rawWriter.department || "BBST Department",
    academicYear: rawWriter.academicYear,
    role: rawWriter.role || "Writer & Contributor",
    expertise: rawWriter.expertise
      ? rawWriter.expertise.split(",").map((e: string) => e.trim()).filter(Boolean)
      : [],
    website: rawWriter.website,
    email: rawWriter.email,
    socialLinks: (rawWriter.socialLinks as Record<string, string>) || {},
    isFeatured: rawWriter.isFeatured,
    publishedArticlesCount: rawWriter.articles.length,
    articles: rawWriter.articles.map((art: RawWriterArticleItem) => ({
      id: art.id,
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt || "",
      coverImage: art.coverImage || "/images/Magazine.png",
      category: art.category,
      publishedAt: art.publishedAt
        ? new Date(art.publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : new Date(art.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
    })),
  };

  return <WriterProfileView writer={writer} />;
}
