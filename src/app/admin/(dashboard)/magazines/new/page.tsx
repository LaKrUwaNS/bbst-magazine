import { Metadata } from "next";
import { MagazineForm } from "@/components/admin/magazine-form";

export const metadata: Metadata = {
  title: "Add New Magazine | BBST Magazine Admin",
};

export const instant = false;

export default function NewMagazinePage() {
  return <MagazineForm isEditing={false} />;
}
