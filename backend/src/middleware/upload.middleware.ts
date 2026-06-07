import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";
import { AppError } from "./errorHandler.middleware";

const UPLOAD_ROOT = path.resolve(process.cwd(), env.UPLOAD_DIR);
const MAX_FILE_BYTES = env.MAX_FILE_SIZE_MB * 1024 * 1024;

// Ensure uploads directory exists synchronously on module load
if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

// ─── Disk storage — unique filenames to avoid collisions ─────────────────

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOAD_ROOT);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

// ─── MIME type filter (first layer — browser-reported) ───────────────────

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  const allowedMimeTypes = ["application/pdf"];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new AppError("Only PDF files are allowed", 415));
    return;
  }

  cb(null, true);
}

// ─── Multer instance ──────────────────────────────────────────────────────

export const uploadPdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_BYTES,
    files: 1,
  },
}).single("file"); // form field name must be "file"

// ─── Magic byte validator (second layer — actual file content) ───────────
//
// PDF files always start with %PDF (hex: 25 50 44 46).
// This runs AFTER multer saves the file so we can read the first bytes.

export async function validatePdfMagicBytes(
  filePath: string
): Promise<boolean> {
  const fd = await fs.promises.open(filePath, "r");
  const buffer = Buffer.alloc(4);
  await fd.read(buffer, 0, 4, 0);
  await fd.close();

  // %PDF in hex
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  );
}

// ─── Multer error handler wrapper ─────────────────────────────────────────
//
// Wraps multer's callback-style middleware so we can use it with async/await
// and convert multer errors into our AppError format.

import { Response, NextFunction } from "express";

export function handleUpload(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  uploadPdf(req, res, (err: unknown) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          new AppError(
            `File too large. Maximum size is ${env.MAX_FILE_SIZE_MB}MB`,
            413
          )
        );
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }

    next(err);
  });
}
