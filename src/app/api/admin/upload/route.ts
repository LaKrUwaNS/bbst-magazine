import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { uploadAsset } from "@/lib/storage";

export async function POST(request: NextRequest) {
  // 1. Enforce admin authentication
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json(
      { error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file was provided in the upload payload." },
        { status: 400 }
      );
    }

    if (type !== "pdf" && type !== "image") {
      return NextResponse.json(
        { error: "Invalid upload type. Must be 'pdf' or 'image'." },
        { status: 400 }
      );
    }

    const folder = (formData.get("folder") as string | null) || undefined;

    const uploadResult = await uploadAsset(file, type, folder);

    return NextResponse.json({
      success: true,
      message: `${type.toUpperCase()} uploaded successfully.`,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      filename: uploadResult.filename,
      sizeBytes: uploadResult.sizeBytes,
      storageProvider: uploadResult.storageProvider,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process upload.";
    console.error("[AdminUpload] Error handling asset upload:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
