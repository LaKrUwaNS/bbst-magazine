import { Metadata } from "next";
import { SubmissionsTable } from "@/components/admin/submissions-table";

export const metadata: Metadata = {
  title: "Submissions Queue | BBST Magazine Admin",
};


export const instant = false;

export default function SubmissionsPage() {
  return <SubmissionsTable />;
}
