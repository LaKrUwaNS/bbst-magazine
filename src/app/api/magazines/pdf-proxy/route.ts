import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";


/**
 * GET /api/magazines/pdf-proxy?url=...
 * Resilient PDF streaming proxy ensuring CORS-compliant, high-performance PDF loading
 * for the online book reader across local files and Cloudinary/external storage.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url")?.trim();

    if (!targetUrl) {
      return NextResponse.json(
        { error: "Target PDF URL is required." },
        { status: 400 }
      );
    }

    // 1. If it is a local relative asset path (e.g. /assets/magazines/...)
    if (targetUrl.startsWith("/") || targetUrl.startsWith("./")) {
      const cleanPath = targetUrl.replace(/^\.?\//, "").split("?")[0];
      const safeFilePath = path.join(process.cwd(), "public", cleanPath);

      // Prevent directory traversal attacks
      const publicRoot = path.join(process.cwd(), "public");
      if (!safeFilePath.startsWith(publicRoot)) {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
      }

      if (!fs.existsSync(safeFilePath)) {
        return NextResponse.json({ error: "PDF asset not found." }, { status: 404 });
      }

      const fileBuffer = fs.readFileSync(safeFilePath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // 2. If it is a remote HTTP/HTTPS URL (e.g. Cloudinary)
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json({ error: "Invalid protocol." }, { status: 400 });
    }

    // Allowed storage domains for SSRF prevention
    const allowedHosts = [
      "res.cloudinary.com",
      "cloudinary.com",
      "images.unsplash.com",
      "localhost",
      "127.0.0.1",
    ];

    const hostAllowed = allowedHosts.some(
      (h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`)
    );

    if (!hostAllowed && process.env.NODE_ENV === "production") {
      console.warn(`[PDF Proxy] Blocked request to non-allowlisted host: ${parsed.hostname}`);
      return NextResponse.json(
        { error: "Requested PDF host is not authorized." },
        { status: 403 }
      );
    }

    const response = await fetch(targetUrl, {
      headers: {
        Accept: "application/pdf,*/*",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Remote PDF fetch failed with status ${response.status}` },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return new NextResponse(Buffer.from(arrayBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      (error as { digest: string }).digest === "NEXT_PRERENDER_INTERRUPTED"
    ) {
      throw error;
    }
    console.error("[PDF Proxy] Unexpected error streaming PDF:", error);
    return NextResponse.json(
      { error: "Failed to stream PDF document." },
      { status: 500 }
    );
  }
}
