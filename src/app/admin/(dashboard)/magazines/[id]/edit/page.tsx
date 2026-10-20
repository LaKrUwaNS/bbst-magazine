import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MagazineForm } from "@/components/admin/magazine-form";

export const metadata: Metadata = {
  title: "Edit Magazine Edition | BBST Magazine Admin",
};

export const instant = false;

export default async function EditMagazinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const magazine = await prisma.magazineIssue.findUnique({
    where: { id },
  });

  if (!magazine) {
    notFound();
  }

  const initialData = {
    id: magazine.id,
    title: magazine.title,
    slug: magazine.slug,
    edition: magazine.edition,
    description: magazine.description,
    coverImage: magazine.coverImage,
    coverImagePublicId: magazine.coverImagePublicId,
    pdfAsset: magazine.pdfAsset,
    pdfAssetPublicId: magazine.pdfAssetPublicId,
    publicationDate: magazine.publicationDate,
    publicationYear: magazine.publicationYear,
    isFeatured: magazine.isFeatured,
    status: (magazine.status as "draft" | "published" | "archived") || "draft",
  };

  return <MagazineForm initialData={initialData} isEditing={true} />;
}
