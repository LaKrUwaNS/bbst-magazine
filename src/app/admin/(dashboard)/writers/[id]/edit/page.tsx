import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WriterEditorForm } from "@/components/admin/writer-editor-form";

export const metadata: Metadata = {
  title: "Edit Writer Profile | BBST Magazine Admin",
};


export const instant = false;

export default async function EditWriterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const writer = await prisma.writerProfile.findUnique({
    where: { id },
    include: {
      articles: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          publishedAt: true,
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!writer) {
    notFound();
  }

  return (
    <WriterEditorForm
      initialData={{
        id: writer.id,
        name: writer.name,
        slug: writer.slug,
        bio: writer.bio,
        shortBio: writer.shortBio,
        profileImageUrl: writer.profileImageUrl,
        profileImagePublicId: writer.profileImagePublicId,
        department: writer.department,
        academicYear: writer.academicYear,
        role: writer.role,
        expertise: writer.expertise,
        email: writer.email,
        website: writer.website,
        socialLinks: (writer.socialLinks as {
          linkedin?: string;
          twitter?: string;
          github?: string;
          website?: string;
        }) || null,
        status: writer.status,
        isFeatured: writer.isFeatured,
        articles: writer.articles,
      }}
    />
  );
}
