import { Metadata } from "next";
import { EmailDiagnosticsView } from "@/components/admin/email-diagnostics-view";

export const metadata: Metadata = {
  title: "Email System & Diagnostics | BBST Magazine",
  description: "Monitor SMTP status, dispatch test emails, and inspect notification audit logs.",
};

export default function AdminEmailPage() {
  return <EmailDiagnosticsView />;
}
