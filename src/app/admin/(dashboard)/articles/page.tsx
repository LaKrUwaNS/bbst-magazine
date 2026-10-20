import { Metadata } from "next";
import { AdminArticlesTable } from "@/components/admin/admin-articles-table";

export const metadata: Metadata = {
  title: "All Articles | BBST Magazine Admin",
};


export const instant = false;

export default function AdminArticlesPage() {
  return <AdminArticlesTable />;
}
