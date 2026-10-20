import { Metadata } from "next";
import { WriterEditorForm } from "@/components/admin/writer-editor-form";

export const metadata: Metadata = {
  title: "Create Writer Profile | BBST Magazine Admin",
};


export const instant = false;

export default function CreateWriterPage() {
  return <WriterEditorForm />;
}
