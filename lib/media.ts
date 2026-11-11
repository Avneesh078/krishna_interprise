import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Uploaded product photos live outside public/, because files added to public/ after a
 * production build are not served. app/media/[file]/route.ts serves them.
 */
export const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_UPLOADS_PER_SAVE = 8;

const FILE_NAME = /^[0-9a-f-]{36}\.webp$/;

export function isUploadName(name: string) {
  return FILE_NAME.test(name);
}

export class UploadError extends Error {}

/** Re-encodes the photo (which also strips camera metadata), resizes it and returns its URL. */
export async function saveProductPhoto(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(`"${file.name}" is larger than 8 MB.`);
  }
  let output: Buffer;
  try {
    output = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 50_000_000 })
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer();
  } catch {
    throw new UploadError(`"${file.name}" is not a photo we can read. Use JPG, PNG or WebP.`);
  }
  const name = `${randomUUID()}.webp`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), output);
  return `/media/${name}`;
}

export async function readUpload(name: string) {
  if (!isUploadName(name)) return null;
  try {
    return await readFile(path.join(UPLOAD_DIR, name));
  } catch {
    return null;
  }
}

/** Removes uploaded files that a product no longer uses. Built-in /catalog images are never touched. */
export async function deleteUploads(urls: string[]) {
  await Promise.all(
    urls
      .filter((url) => url.startsWith("/media/"))
      .map((url) => url.slice("/media/".length))
      .filter(isUploadName)
      .map((name) => unlink(path.join(UPLOAD_DIR, name)).catch(() => {})),
  );
}
