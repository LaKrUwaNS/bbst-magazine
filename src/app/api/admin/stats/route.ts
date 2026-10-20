import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getEditorialDashboardStats } from "@/lib/editorial/editorial-service";

export async function GET() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await getEditorialDashboardStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("[Admin Stats API] Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard metrics." },
      { status: 500 }
    );
  }
}
