import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminLoginCard } from "@/components/admin/admin-login-card";

export const metadata: Metadata = {
  title: "Editor Sign In | BBST Magazine",
  description: "Secure editor administration access for BBST Student Magazine.",
};

export const instant = false;

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session.authenticated) {
    redirect("/admin");
  }

  return <AdminLoginCard />;
}
