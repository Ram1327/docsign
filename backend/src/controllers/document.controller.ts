import { Request, Response, NextFunction } from "express";
import path from "path";
import * as documentService from "../services/document.service";
import { resolveFilePath } from "../services/storage.service";
import { sendSuccess, sendPaginated, sendError } from "../utils/response.utils";
import { env } from "../config/env";

// ─── POST /api/documents/upload ───────────────────────────────────────────

export async function upload(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      sendError(res, "No file uploaded", 400);
      return;
    }

    const title =
      (req.body as { title?: string }).title?.trim() ||
      req.file.originalname.replace(/\.pdf$/i, "");

    const doc = await documentService.uploadDocument({
      title,
      ownerId: req.user!.userId,
      file: req.file,
    });

    sendSuccess(res, "Document uploaded successfully", doc, 201);
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/documents ───────────────────────────────────────────────────

export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(String(req.query.limit ?? "10"), 10))
    );
    const status = req.query.status as string | undefined;

    const { documents, total } = await documentService.listDocuments({
      ownerId: req.user!.userId,
      page,
      limit,
      status,
    });

    sendPaginated(res, "Documents retrieved", documents, total, page, limit);
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/documents/:id ───────────────────────────────────────────────

export async function getOne(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doc = await documentService.getDocument(
      req.params.id,
      req.user!.userId
    );
    sendSuccess(res, "Document retrieved", doc);
  } catch (error) {
    next(error);
  }
}

// ─── DELETE /api/documents/:id ────────────────────────────────────────────

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await documentService.deleteDocument(req.params.id, req.user!.userId);
    sendSuccess(res, "Document deleted successfully");
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/documents/:id/file ─────────────────────────────────────────
// Protected file serving — only the document owner gets the raw PDF

export async function serveFile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const signed = req.path.includes("signed-file");
    const relativePath = await documentService.getDocumentFilePath(
      req.params.id,
      req.user!.userId,
      signed
    );

    const absolutePath = resolveFilePath(relativePath);
    const fileName = path.basename(relativePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${fileName}"`
    );

    // Prevent caching of protected files
    if (env.NODE_ENV === "production") {
      res.setHeader("Cache-Control", "private, no-store");
    }

    res.sendFile(absolutePath);
  } catch (error) {
    next(error);
  }
}
