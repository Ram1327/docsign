import path from "path";
import { DocumentModel, IDocumentDocument } from "../models/Document.model";
import { AppError } from "../middleware/errorHandler.middleware";
import {
  deleteFile,
  toRelativePath,
  validatePdfMagicBytes,
} from "./storage.service";

// ─── Types ────────────────────────────────────────────────────────────────

export interface UploadDocumentInput {
  title: string;
  ownerId: string;
  file: Express.Multer.File;
}

export interface ListDocumentsOptions {
  ownerId: string;
  page: number;
  limit: number;
  status?: string;
}

// ─── Upload ───────────────────────────────────────────────────────────────

export async function uploadDocument(
  input: UploadDocumentInput
): Promise<IDocumentDocument> {
  const { title, ownerId, file } = input;

  // Magic byte validation — confirms it's actually a PDF regardless of extension
  const isValidPdf = await validatePdfMagicBytes(file.path);
  if (!isValidPdf) {
    // Clean up the already-saved file before throwing
    await deleteFile(toRelativePath(file.path));
    throw new AppError(
      "Invalid file content. Only valid PDF files are accepted.",
      415
    );
  }

  const relativePath = toRelativePath(file.path);

  const doc = await DocumentModel.create({
    title: title.trim(),
    originalFileName: file.originalname,
    fileUrl: relativePath,
    mimeType: file.mimetype,
    fileSize: file.size,
    ownerId,
  });

  return doc;
}

// ─── List ─────────────────────────────────────────────────────────────────

export async function listDocuments(options: ListDocumentsOptions): Promise<{
  documents: IDocumentDocument[];
  total: number;
}> {
  const { ownerId, page, limit, status } = options;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { ownerId, isDeleted: false };
  if (status && ["pending", "signed", "rejected"].includes(status)) {
    filter.status = status;
  }

  const [documents, total] = await Promise.all([
    DocumentModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    DocumentModel.countDocuments(filter),
  ]);

  return { documents: documents ?? [], total };
}

// ─── Get single ───────────────────────────────────────────────────────────

export async function getDocument(
  documentId: string,
  ownerId: string
): Promise<IDocumentDocument> {
  const doc = await DocumentModel.findOne({
    _id: documentId,
    ownerId,
    isDeleted: false,
  });

  if (!doc) {
    throw new AppError("Document not found", 404);
  }

  return doc;
}

// ─── Soft delete ──────────────────────────────────────────────────────────

export async function deleteDocument(
  documentId: string,
  ownerId: string
): Promise<void> {
  const doc = await DocumentModel.findOne({
    _id: documentId,
    ownerId,
    isDeleted: false,
  });

  if (!doc) {
    throw new AppError("Document not found", 404);
  }

  if (doc.status === "signed") {
    throw new AppError("Cannot delete a signed document", 403);
  }

  // Soft delete — preserves audit trail references
  doc.isDeleted = true;
  await doc.save();
}

// ─── Get file path for serving ────────────────────────────────────────────

export async function getDocumentFilePath(
  documentId: string,
  ownerId: string,
  signed = false
): Promise<string> {
  const doc = await getDocument(documentId, ownerId);

  const fileUrl = signed ? doc.signedFileUrl : doc.fileUrl;

  if (!fileUrl) {
    throw new AppError(
      signed ? "Signed file not available yet" : "File not found",
      404
    );
  }

  // resolveFilePath is called by the controller from storage.service
  return fileUrl;
}

// ─── Get document by ID only (for public signing — no owner check) ────────

export async function getDocumentById(
  documentId: string
): Promise<IDocumentDocument> {
  const doc = await DocumentModel.findOne({
    _id: documentId,
    isDeleted: false,
  });

  if (!doc) {
    throw new AppError("Document not found", 404);
  }

  return doc;
}

// ─── Used internally by other services (signature finalize on Day 8) ──────

export async function updateDocumentStatus(
  documentId: string,
  status: "pending" | "signed" | "rejected",
  signedFileUrl?: string
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (signedFileUrl) update.signedFileUrl = signedFileUrl;

  await DocumentModel.findByIdAndUpdate(documentId, update);
}

// ─── Helper: get full file path for serving ──────────────────────────────

export function buildFileName(originalName: string): string {
  return path.basename(originalName);
}
