import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const instant = false;

export default async function MagazineDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const magazine = await prisma.magazineIssue.findUnique({
    where: { slug },
  });

  if (!magazine || magazine.status !== "published") {
    notFound();
  }

  return (
    <article className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold">{magazine.title}</h1>

      {magazine.publicationDate && (
        <p className="text-sm text-gray-500 border-b border-gray-200 pb-4">
          Published on:{" "}
          {new Date(magazine.publicationDate).toLocaleDateString()}
        </p>
      )}

      {magazine.coverImage && (
        <div className="my-6 text-center">
          <Image
            src={magazine.coverImage}
            alt={magazine.title}
            width={1080}
            height={1440}
            priority
            className="max-w-full h-auto max-h-125 object-contain rounded-md inline-block"
          />
        </div>
      )}

      {magazine.description && (
        <div className="prose max-w-none text-gray-800">
          <p>{magazine.description}</p>
        </div>
      )}

      {magazine.pdfAsset && (
        <div className="mt-8 pt-4 border-t border-gray-200">
          <a
            href={magazine.pdfAsset}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            Read Magazine (PDF)
          </a>
        </div>
      )}
    </article>
  );
}
