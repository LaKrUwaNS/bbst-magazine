import React from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const instant = false;

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const session = await getAdminSession();
  if (!session.authenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col lg:flex-row text-[#171717]">
      <AdminSidebar username={session.username} />
      <main className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
