import path from "path";
import fs from "fs/promises";
import { SignatureModel, ISignatureDocument } from "../models/Signature.model";
import { DocumentModel } from "../models/Document.model";
import { AppError } from "../middleware/errorHandler.middleware";
import { embedSignatures } from "./pdfProcessor.service";
import { resolveFilePath } from "./storage.service";
import { env } from "../config/env";

// ─── Types ────────────────────────────────────────────────────────────────

export interface CreateSignatureInput {
  documentId: string;
  ownerId: string;
  signerEmail?: string;
  x: number;
  y: number;
  page: number;
  pageWidth: number;
  pageHeight: number;
}

export interface UpdateSignatureStatusInput {
  signatureId: string;
  documentId: string;
  status: "signed" | "rejected";
  rejectionReason?: string;
  signerName?: string;
}

// ─── Create ───────────────────────────────────────────────────────────────

export async function createSignature(
  input: CreateSignatureInput
): Promise<ISignatureDocument> {
  const doc = await DocumentModel.findOne({
    _id: input.documentId,
    ownerId: input.ownerId,
    isDeleted: false,
  });

  if (!doc) throw new AppError("Document not found or access denied", 404);
  if (doc.status === "signed")
    throw new AppError("Cannot add signatures to an already signed document", 403);

  return SignatureModel.create({
    documentId: input.documentId,
    signerEmail: input.signerEmail ?? null,
    x: input.x,
    y: input.y,
    page: input.page,
    pageWidth: input.pageWidth,
    pageHeight: input.pageHeight,
  });
}

// ─── List by document ─────────────────────────────────────────────────────

export async function listSignatures(
  documentId: string,
  ownerId: string
): Promise<ISignatureDocument[]> {
  const doc = await DocumentModel.findOne({
    _id: documentId,
    ownerId,
    isDeleted: false,
  });
  if (!doc) throw new AppError("Document not found or access denied", 404);

  return SignatureModel.find({ documentId }).sort({ page: 1, createdAt: 1 });
}

// ─── Delete ───────────────────────────────────────────────────────────────

export async function deleteSignature(
  signatureId: string,
  ownerId: string
): Promise<void> {
  const signature = await SignatureModel.findById(signatureId).populate<{
    documentId: { ownerId: { toString(): string }; status: string };
  }>("documentId", "ownerId status");

  if (!signature) throw new AppError("Signature field not found", 404);

  const doc = signature.documentId as unknown as {
    ownerId: { toString(): string };
    status: string;
  };

  if (doc.ownerId.toString() !== ownerId) throw new AppError("Access denied", 403);
  if (doc.status === "signed") throw new AppError("Cannot remove signatures from a signed document", 403);
  if (signature.status === "signed") throw new AppError("Cannot remove an already-signed field", 403);

  await SignatureModel.findByIdAndDelete(signatureId);
}

// ─── Update status (sign / reject) ───────────────────────────────────────

export async function updateSignatureStatus(
  input: UpdateSignatureStatusInput
): Promise<ISignatureDocument> {
  const signature = await SignatureModel.findOne({
    _id: input.signatureId,
    documentId: input.documentId,
  });
  if (!signature) throw new AppError("Signature not found", 404);

  signature.status = input.status;
  if (input.status === "signed") signature.signedAt = new Date();
  if (input.rejectionReason) signature.rejectionReason = input.rejectionReason;

  await signature.save();
  return signature;
}

// ─── Finalize document — embed all signatures + generate signed PDF ───────

export async function finalizeDocument(
  documentId: string,
  ownerId: string
): Promise<{ signedFileUrl: string }> {
  const doc = await DocumentModel.findOne({
    _id: documentId,
    ownerId,
    isDeleted: false,
  });
  if (!doc) throw new AppError("Document not found or access denied", 404);
  if (doc.status === "signed") throw new AppError("Document already finalized", 400);

  const signatures = await SignatureModel.find({ documentId });
  if (signatures.length === 0) throw new AppError("No signature fields to finalize", 400);

  // Mark all pending signatures as signed
  await SignatureModel.updateMany(
    { documentId, status: "pending" },
    { status: "signed", signedAt: new Date() }
  );

  // Re-fetch with updated statuses
  const updatedSigs = await SignatureModel.find({ documentId });

  // Embed into PDF
  const { buffer } = await embedSignatures({
    fileUrl: doc.fileUrl,
    signatures: updatedSigs,
  });

  // Save signed PDF to disk
  const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);
  const signedFileName = `signed_${path.basename(doc.fileUrl)}`;
  const signedAbsPath = path.join(uploadRoot, signedFileName);
  await fs.writeFile(signedAbsPath, buffer);

  // Update document record
  doc.status = "signed";
  doc.signedFileUrl = signedFileName;
  await doc.save();

  return { signedFileUrl: signedFileName };
}

// ─── Get all signatures (no owner check — used by public signing) ─────────

export async function getSignaturesByDocument(
  documentId: string
): Promise<ISignatureDocument[]> {
  return SignatureModel.find({ documentId }).sort({ page: 1, createdAt: 1 });
}
