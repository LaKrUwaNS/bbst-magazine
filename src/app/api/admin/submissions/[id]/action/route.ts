import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { executeReviewAction } from "@/lib/editorial/editorial-service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum([
    "APPROVE",
    "PUBLISH",
    "UNPUBLISH",
    "REQUEST_REVISION",
    "REJECT",
    "MOVE_TO_REVIEW",
  ]),
  feedback: z.string().trim().nullish().transform((v) => v || undefined),
  reason: z.string().trim().nullish().transform((v) => v || undefined),
});

export async function POST(
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
    const parsed = actionSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    const { action, feedback, reason } = parsed.data;

    const updated = await executeReviewAction({
      articleId: id,
      editorName: session.username || "editor@bbst.uwu.ac.lk",
      action,
      feedback,
      reason,
    });

    // Revalidate public articles cache
    revalidatePath("/articles");
    revalidatePath(`/articles/${updated.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: `Editorial action ${action} executed successfully.`,
      article: updated,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to execute review action.";
    console.error("[Admin Review Action API] Error:", error);
    return NextResponse.json({ error: errMessage }, { status: 400 });
  }
}
