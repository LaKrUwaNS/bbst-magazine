import { NextRequest, NextResponse } from "next/server";
import { uploadAsset } from "@/lib/storage";

const uploadRateMap = new Map<string, { count: number; expiresAt: number }>();
const MAX_UPLOADS_PER_HOUR = 15;
const WINDOW_MS = 60 * 60 * 1000;

function checkUploadRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = uploadRateMap.get(ip);
  if (!entry || now > entry.expiresAt) {
    uploadRateMap.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_UPLOADS_PER_HOUR) return false;
  entry.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!checkUploadRateLimit(ip)) {
      return NextResponse.json(
        { error: "Upload rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    // Verify it's an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image (JPEG, PNG, or WebP)." },
        { status: 400 }
      );
    }

    const uploadResult = await uploadAsset(file, "image", "bbst-magazine/article-covers");

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      filename: uploadResult.filename,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image.";
    console.error("[Public Upload Cover API] Error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
