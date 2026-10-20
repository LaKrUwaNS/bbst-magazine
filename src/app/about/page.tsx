import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AboutView } from "@/components/about/about-view";
import type { TeamMember } from "@/components/about/about-team";

export const metadata: Metadata = {
  title: "About BBST Magazine | Uva Wellassa University",
  description:
    "Discover the story, mission, research, student creativity, and editorial community behind the BBST Student Magazine of Uva Wellassa University.",
  openGraph: {
    title: "About BBST Magazine | Uva Wellassa University",
    description:
      "Stories That Inspire. Ideas That Shape the Future. The official student publication of Uva Wellassa University.",
    images: [
      {
        url: "/images/Magazine.png",
        width: 1200,
        height: 630,
        alt: "BBST Magazine Cover",
      },
    ],
  },
};

export const instant = false;

export default async function AboutPage() {
  let articlesCount = 0;
  let magazinesCount = 0;
  let contributorsCount = 0;
  let categoriesCount = 0;
  let teamMembers: TeamMember[] | undefined = undefined;

  try {
    const [articles, magazines, writers, users, categories, editorUsers] =
      await Promise.all([
        prisma.article.count({ where: { status: { in: ["PUBLISHED", "published"] } } }),
        prisma.magazineIssue.count({ where: { status: { in: ["published", "PUBLISHED"] } } }),
        prisma.writerProfile.count({ where: { status: { in: ["PUBLISHED", "published"] } } }),
        prisma.user.count(),
        prisma.category.count(),
        prisma.user.findMany({
          where: {
            OR: [{ role: "ADMIN" }, { role: "EDITOR" }],
          },
          take: 4,
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        }),
      ]);

    articlesCount = articles;
    magazinesCount = magazines;
    contributorsCount = Math.max(writers, users, 1);
    categoriesCount = categories;

    // If editor users exist in DB with valid details, map them
    if (editorUsers && editorUsers.length > 0) {
      teamMembers = editorUsers.map((u, i) => {
        const defaultRoles = [
          "Editor-in-Chief",
          "Associate Editor — Sciences",
          "Features & Culture Editor",
          "Creative & Production Lead",
        ];
        const defaultDepartments = [
          "Computer Science & Informatics",
          "Faculty of Applied Sciences",
          "Department of Humanities",
          "Faculty of Engineering",
        ];
        const defaultBios = [
          "Undergraduate passionate about artificial intelligence, educational accessibility, and student journalism.",
          "Undergraduate researcher focused on sustainable soil enrichment, microbial technology, and circular agriculture.",
          "Campus photojournalist and writer exploring student culture, creative expression, and university dialogue.",
          "Specializes in digital publication layouts, visual storytelling, and renewable energy technology systems.",
        ];
        const defaultAvatars = [
          "/images/avatar1.jpg",
          "/images/avatar2.jpg",
          "/images/avatar3.jpg",
          "/images/avatar4.jpg",
        ];

        return {
          id: u.id,
          name: u.name,
          role: u.role === "ADMIN" ? "Editor-in-Chief" : defaultRoles[i % defaultRoles.length],
          department: defaultDepartments[i % defaultDepartments.length],
          bio: defaultBios[i % defaultBios.length],
          avatar: u.image || defaultAvatars[i % defaultAvatars.length],
          email: u.email,
          linkedin: "https://linkedin.com",
        };
      });
    }
  } catch (error) {
    console.error("[AboutPage] Error loading metrics from database:", error);
  }

  return (
    <AboutView
      articlesCount={articlesCount}
      magazinesCount={magazinesCount}
      contributorsCount={contributorsCount}
      categoriesCount={categoriesCount}
      teamMembers={teamMembers}
    />
  );
}
