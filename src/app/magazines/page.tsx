import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function MagazinesPage() {
  const magazines = await prisma.magazineIssue.findMany({
    where: { status: "published" },
    orderBy: { publicationDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold border-b border-gray-200 pb-2">Magazines</h1>

      {magazines.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {magazines.map((magazine) => (
            <li key={magazine.id} className="border border-gray-200 p-4 rounded-md flex flex-col">
              {magazine.coverImage && (
                <div className="relative mb-4 h-48 w-full overflow-hidden rounded-sm bg-gray-100">
                  <Image
                    src={magazine.coverImage}
                    alt={magazine.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              <h2 className="text-xl font-bold mb-2">
                <Link href={`/magazines/${magazine.slug}`} className="hover:underline">
                  {magazine.title}
                </Link>
              </h2>
              {magazine.publicationDate && (
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(magazine.publicationDate).toLocaleDateString()}
                </p>
              )}
              {magazine.description && <p className="text-gray-700 mb-4 flex-1">{magazine.description}</p>}
              {magazine.pdfAsset && (
                <a href={magazine.pdfAsset} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-medium">
                  View PDF
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No magazines published yet.</p>
      )}
    </div>
  );
}
