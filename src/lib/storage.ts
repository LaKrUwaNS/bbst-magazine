import fs from "fs";
import path from "path";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary if credentials are configured
const isCloudinaryConfigured =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  process.env.CLOUDINARY_CLOUD_NAME !== "YOUR_CLOUD_NAME" &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  process.env.CLOUDINARY_API_KEY !== "YOUR_API_KEY" &&
  Boolean(process.env.CLOUDINARY_API_SECRET) &&
  process.env.CLOUDINARY_API_SECRET !== "YOUR_API_SECRET";

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface UploadResult {
  url: string;
  filename: string;
  publicId: string;
  sizeBytes: number;
  mimeType: string;
  storageProvider: "cloudinary" | "local";
}

const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Validates file headers (magic bytes) to prevent disguised file extensions.
 */
function validateMagicBytes(buffer: Buffer, expectedType: "pdf" | "image"): boolean {
  if (buffer.length < 4) return false;

  if (expectedType === "pdf") {
    // PDF starts with %PDF (0x25 0x50 0x44 0x46)
    return (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    );
  }

  if (expectedType === "image") {
    // JPEG: FF D8 FF
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    // PNG: 89 50 4E 47
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;
    // WebP: RIFF ... WEBP
    const isWebp =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer.length > 11 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;

    return isJpeg || isPng || isWebp;
  }

  return false;
}

/**
 * Uploads a file (PDF or Image) to persistent storage (Cloudinary if configured, else local uploads directory).
 */
export async function uploadAsset(
  file: File,
  type: "pdf" | "image",
  customFolder?: string
): Promise<UploadResult> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 1. Validate file size
  const maxSize = type === "pdf" ? MAX_PDF_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  if (buffer.length > maxSize) {
    const maxMb = maxSize / (1024 * 1024);
    throw new Error(
      `File size exceeds maximum permitted limit of ${maxMb}MB.`
    );
  }

  // 2. Validate magic bytes
  if (!validateMagicBytes(buffer, type)) {
    throw new Error(
      `Invalid ${type.toUpperCase()} file signature. File content does not match allowed format.`
    );
  }

  // 3. Generate sanitized unique filename
  const rawExt = path.extname(file.name).toLowerCase();
  const ext =
    type === "pdf"
      ? ".pdf"
      : rawExt === ".png"
      ? ".png"
      : rawExt === ".webp"
      ? ".webp"
      : ".jpg";

  const randomHash = crypto.randomBytes(8).toString("hex");
  const baseName = path
    .basename(file.name, rawExt)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 32);

  const finalFilename = `${baseName}-${Date.now()}-${randomHash}${ext}`;
  const assetPublicId = path.basename(finalFilename, ext);

  // 4. If Cloudinary is configured, upload to Cloudinary
  if (isCloudinaryConfigured) {
    try {
      const folder =
        customFolder ||
        (type === "pdf" ? "bbst-magazine/pdfs" : "bbst-magazine/covers");
      const resourceType = type === "pdf" ? "raw" : "image";

      const uploadPromise = new Promise<{ secure_url: string; public_id: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: resourceType,
              public_id: assetPublicId,
              overwrite: true,
            },
            (error, result) => {
              if (error || !result) {
                reject(error || new Error("Cloudinary upload failed"));
              } else {
                resolve({
                  secure_url: result.secure_url,
                  public_id: result.public_id,
                });
              }
            }
          );
          stream.end(buffer);
        }
      );

      const result = await uploadPromise;
      return {
        url: result.secure_url,
        filename: finalFilename,
        publicId: result.public_id,
        sizeBytes: buffer.length,
        mimeType: file.type || (type === "pdf" ? "application/pdf" : "image/jpeg"),
        storageProvider: "cloudinary",
      };
    } catch (err) {
      console.warn(
        "[Storage] Cloudinary upload failed, falling back to local storage:",
        err
      );
    }
  }

  // 5. Local Storage Fallback
  const subFolder = type === "pdf" ? "magazines" : "covers";
  const uploadsDir = path.join(process.cwd(), "public", "uploads", subFolder);

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, finalFilename);
  fs.writeFileSync(filePath, buffer);

  const publicUrl = `/uploads/${subFolder}/${finalFilename}`;

  return {
    url: publicUrl,
    filename: finalFilename,
    publicId: assetPublicId,
    sizeBytes: buffer.length,
    mimeType: file.type || (type === "pdf" ? "application/pdf" : "image/jpeg"),
    storageProvider: "local",
  };
}

/**
 * Safely removes an asset from storage (Cloudinary or local).
 */
export async function deleteAsset(
  publicIdOrUrl: string,
  type: "pdf" | "image"
): Promise<boolean> {
  if (!publicIdOrUrl) return false;

  // Cloudinary cleanup
  if (isCloudinaryConfigured && !publicIdOrUrl.startsWith("/uploads/")) {
    try {
      const resourceType = type === "pdf" ? "raw" : "image";
      await cloudinary.uploader.destroy(publicIdOrUrl, { resource_type: resourceType });
      return true;
    } catch (err) {
      console.warn("[Storage] Cloudinary deletion error:", err);
    }
  }

  // Local filesystem cleanup
  if (publicIdOrUrl.startsWith("/uploads/")) {
    try {
      const localPath = path.join(process.cwd(), "public", publicIdOrUrl);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        return true;
      }
    } catch (err) {
      console.warn("[Storage] Local file deletion error:", err);
    }
  }

  return false;
}

