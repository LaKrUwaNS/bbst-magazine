import { Metadata } from "next";
import { magazineRepository } from "@/lib/magazines/magazine-repository";
import { MagazinesView } from "@/components/magazines/magazines-view";

export const metadata: Metadata = {
  title: "Explore Our Magazines | BBST Student Magazine",
  description:
    "Browse, read online, and download publications from the Faculty of Technological Studies at Uva Wellassa University.",
};


export const instant = false;

export default async function MagazinesPage() {
  const magazines = await magazineRepository.getMagazines({ sortBy: "newest" });

  return <MagazinesView initialMagazines={magazines} />;
}
