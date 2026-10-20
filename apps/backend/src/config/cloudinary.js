import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const UPLOAD_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "uploads"
);

/* Cloudinary is only usable once CLOUDINARY_URL (or the individual
 * CLOUDINARY_* vars) is present. Until then we keep the admin "add product
 * with photos" flow working by writing the file to /uploads and serving it
 * from Express - the returned path is origin-relative, so the Next rewrite
 * proxies it and no CORS setup is needed for images. */
const cloudinaryReady = Boolean(
  process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET)
);

if (cloudinaryReady && !process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const EXT_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

export const uploadFile = async (file) => {
  if (cloudinaryReady) {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      {
        folder: "mobile-products",
        resource_type: "image"
      }
    );

    return result;
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const ext = EXT_BY_MIME[file.mimetype] ?? ".jpg";
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), file.buffer);

  return { secure_url: `/uploads/${name}` };
};

export const uploadDir = UPLOAD_DIR;
export default cloudinary;
