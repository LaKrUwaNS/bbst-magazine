import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
    redirect: "/admin/login",
  });

  clearAdminSessionCookie(response);
  return response;
}
