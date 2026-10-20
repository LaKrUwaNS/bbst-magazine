import { Metadata } from "next";
import { notFound } from "next/navigation";
import { magazineRepository } from "@/lib/magazines/magazine-repository";
import { MagazineDetailView } from "@/components/magazines/magazine-detail-view";

export const instant = false;

interface MagazineDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: MagazineDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const magazine = await magazineRepository.getMagazineBySlug(slug);

  if (!magazine) {
    return {
      title: "Magazine Not Found | BBST Student Magazine",
    };
  }

  return {
    title: `${magazine.title} | BBST Student Magazine`,
    description: magazine.description,
  };
}

export default async function MagazineDetailPage({
  params,
}: MagazineDetailPageProps) {
  const { slug } = await params;
  const magazine = await magazineRepository.getMagazineBySlug(slug);

  if (!magazine || magazine.status !== "published") {
    notFound();
  }

  return <MagazineDetailView magazine={magazine} />;
}
