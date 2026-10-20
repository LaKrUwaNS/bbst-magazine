import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/writers/[slug] - Public individual writer profile endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const writer = await prisma.writerProfile.findFirst({
      where: {
        slug: { equals: slug, mode: "insensitive" },
        status: "PUBLISHED",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        bio: true,
        shortBio: true,
        profileImageUrl: true,
        department: true,
        academicYear: true,
        role: true,
        expertise: true,
        website: true,
        socialLinks: true,
        isFeatured: true,
        createdAt: true,
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

    if (!writer) {
      return NextResponse.json(
        { error: "Writer profile not found or is currently private." },
        { status: 404 }
      );
    }

    const formattedWriter = {
      id: writer.id,
      name: writer.name,
      slug: writer.slug,
      bio: writer.bio || "",
      shortBio: writer.shortBio || "",
      profileImageUrl: writer.profileImageUrl || "/images/avatar1.jpg",
      department: writer.department || "BBST Department",
      academicYear: writer.academicYear,
      role: writer.role || "Writer & Researcher",
      expertise: writer.expertise
        ? writer.expertise.split(",").map((e) => e.trim()).filter(Boolean)
        : [],
      website: writer.website,
      socialLinks: (writer.socialLinks as Record<string, string>) || {},
      isFeatured: writer.isFeatured,
      publishedArticlesCount: writer.articles.length,
      articles: writer.articles.map((art) => ({
        id: art.id,
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt || "",
        coverImage: art.coverImage || "/images/Magazine.png",
        category: art.category || { id: "general", name: "General", slug: "general" },
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

    return NextResponse.json({
      success: true,
      writer: formattedWriter,
    });
  } catch (error) {
    console.error("[Public Writer Detail API] Error:", error);
    return NextResponse.json({ error: "Failed to retrieve writer profile." }, { status: 500 });
  }
}
