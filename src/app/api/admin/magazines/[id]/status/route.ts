import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendMagazinePublishedAlert } from "@/lib/email/email-service";

const toggleStatusSchema = z.object({
  status: z.enum(["draft", "published", "archived"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = toggleStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid status value. Must be 'draft', 'published', or 'archived'." },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    const existing = await prisma.magazineIssue.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Magazine not found." }, { status: 404 });
    }

    const updated = await prisma.magazineIssue.update({
      where: { id },
      data: { status },
    });

    if (status === "published" && existing.status !== "published") {
      sendMagazinePublishedAlert({
        issueTitle: updated.title,
        issueNumber: updated.edition || "Current Edition",
        description: updated.description,
        coverImageUrl: updated.coverImage,
        slug: updated.slug,
        downloadUrl: updated.pdfAsset,
      }).catch((emailErr) => {
        console.error("[AdminMagazines API] Failed to dispatch publication email:", emailErr);
      });
    }

    revalidatePath("/magazines");
    revalidatePath(`/magazines/${existing.slug}`);
    revalidatePath("/admin");

    const message =
      status === "published"
        ? `Magazine "${updated.title}" published successfully.`
        : `Magazine "${updated.title}" set to ${status}.`;

    return NextResponse.json({
      success: true,
      message,
      magazine: updated,
    });
  } catch (error) {
    console.error("[AdminMagazines API] Error updating status:", error);
    return NextResponse.json(
      { error: "Failed to update publication status." },
      { status: 500 }
    );
  }
}
