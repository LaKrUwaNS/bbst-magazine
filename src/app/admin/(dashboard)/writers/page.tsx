import { Metadata } from "next";
import { WritersTable } from "@/components/admin/writers-table";

export const metadata: Metadata = {
  title: "Writer Profiles | BBST Magazine Admin",
  description: "Manage student writers, researchers, contributors, and authors.",
};


export const instant = false;

export default function WritersManagementPage() {
  return <WritersTable />;
}
