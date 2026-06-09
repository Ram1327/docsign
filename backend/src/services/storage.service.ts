import fs from "fs/promises";
import path from "path";
import { env } from "../config/env";

const UPLOAD_ROOT = path.resolve(process.cwd(), env.UPLOAD_DIR);

// ─── Ensure upload directory exists ──────────────────────────────────────

export async function ensureUploadDir(): Promise<void> {
  await fs.mkdir(UPLOAD_ROOT, { recursive: true });
}

// ─── Resolve a stored relative path to absolute ──────────────────────────

export function resolveFilePath(relativePath: string): string {
  return path.join(UPLOAD_ROOT, relativePath);
}

/**
 * Returns the relative path stored in the DB from an absolute disk path.
 * Strips the upload root prefix so paths are portable.
 */
export function toRelativePath(absolutePath: string): string {
  return path.relative(UPLOAD_ROOT, absolutePath);
}

// ─── Delete a file by its stored relative path ───────────────────────────

export async function deleteFile(relativePath: string): Promise<void> {
  try {
    const fullPath = resolveFilePath(relativePath);
    await fs.unlink(fullPath);
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw err;
  }
}

// ─── Read a file buffer (used by PDF-Lib on Day 8) ───────────────────────

export async function readFileBuffer(relativePath: string): Promise<Buffer> {
  const fullPath = resolveFilePath(relativePath);
  return fs.readFile(fullPath);
}

// ─── Check if file exists ─────────────────────────────────────────────────

export async function fileExists(relativePath: string): Promise<boolean> {
  try {
    await fs.access(resolveFilePath(relativePath));
    return true;
  } catch {
    return false;
  }
}

// ─── Magic byte validator ─────────────────────────────────────────────────
// PDF files always start with %PDF (hex: 25 50 44 46).
// Runs after Multer saves the file so we can read the actual bytes.
// Prevents disguised files (e.g. .exe renamed to .pdf) from being accepted.

export async function validatePdfMagicBytes(
  filePath: string
): Promise<boolean> {
  const fd = await fs.open(filePath, "r");
  const buffer = Buffer.alloc(4);
  await fd.read(buffer, 0, 4, 0);
  await fd.close();

  return (
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46    // F
  );
}

/*
 * ─── Production upgrade note ─────────────────────────────────────────────
 *
 * To swap local disk for S3, replace the functions above with:
 *   - ensureUploadDir()  → no-op (S3 buckets don't need pre-creation)
 *   - resolveFilePath()  → build S3 presigned GET URL
 *   - deleteFile()       → s3.deleteObject({ Bucket, Key })
 *   - readFileBuffer()   → s3.getObject({ Bucket, Key }) → Body.toBuffer()
 *
 * The rest of the codebase stays unchanged because nothing imports S3 directly.
 * All callers go through this service.
 */
