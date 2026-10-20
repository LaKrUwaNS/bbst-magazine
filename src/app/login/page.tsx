import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminLoginCard } from "@/components/admin/admin-login-card";

export const metadata: Metadata = {
  title: "Sign In | BBST Magazine",
  description: "Sign in to the BBST Student Magazine portal.",
};

export const instant = false;

export default async function LoginPage() {
  const session = await getAdminSession();
  if (session.authenticated) {
    redirect("/admin");
  }

  return <AdminLoginCard />;
}
