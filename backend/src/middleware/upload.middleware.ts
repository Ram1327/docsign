import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
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
  if (file.mimetype !== "application/pdf") {
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
}).single("file");

// ─── Multer error handler wrapper ────────────────────────────────────────

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
