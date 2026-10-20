import { Metadata } from "next";
import { AdminCategoriesTable } from "@/components/admin/admin-categories-table";

export const metadata: Metadata = {
  title: "Categories Management | BBST Magazine Admin",
};


export const instant = false;

export default function AdminCategoriesPage() {
  return <AdminCategoriesTable />;
}
