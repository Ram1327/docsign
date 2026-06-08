import { SignatureModel, ISignatureDocument } from "../models/Signature.model";
import { DocumentModel } from "../models/Document.model";
import { AppError } from "../middleware/errorHandler.middleware";

// ─── Types ────────────────────────────────────────────────────────────────

export interface CreateSignatureInput {
  documentId: string;
  ownerId: string; // verified against document
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
}

// ─── Create ───────────────────────────────────────────────────────────────

export async function createSignature(
  input: CreateSignatureInput
): Promise<ISignatureDocument> {
  // Verify the document exists and belongs to the requesting user
  const doc = await DocumentModel.findOne({
    _id: input.documentId,
    ownerId: input.ownerId,
    isDeleted: false,
  });

  if (!doc) {
    throw new AppError("Document not found or access denied", 404);
  }

  if (doc.status === "signed") {
    throw new AppError("Cannot add signatures to an already signed document", 403);
  }

  const signature = await SignatureModel.create({
    documentId: input.documentId,
    signerEmail: input.signerEmail ?? null,
    x: input.x,
    y: input.y,
    page: input.page,
    pageWidth: input.pageWidth,
    pageHeight: input.pageHeight,
  });

  return signature;
}

// ─── List by document ─────────────────────────────────────────────────────

export async function listSignatures(
  documentId: string,
  ownerId: string
): Promise<ISignatureDocument[]> {
  // Verify ownership
  const doc = await DocumentModel.findOne({
    _id: documentId,
    ownerId,
    isDeleted: false,
  });

  if (!doc) {
    throw new AppError("Document not found or access denied", 404);
  }

  return SignatureModel.find({ documentId }).sort({ page: 1, createdAt: 1 });
}

// ─── Delete a single signature field ─────────────────────────────────────

export async function deleteSignature(
  signatureId: string,
  ownerId: string
): Promise<void> {
  const signature = await SignatureModel.findById(signatureId).populate<{
    documentId: { ownerId: string; status: string };
  }>("documentId", "ownerId status");

  if (!signature) {
    throw new AppError("Signature field not found", 404);
  }

  const doc = signature.documentId as unknown as {
    ownerId: { toString(): string };
    status: string;
  };

  if (doc.ownerId.toString() !== ownerId) {
    throw new AppError("Access denied", 403);
  }

  if (doc.status === "signed") {
    throw new AppError("Cannot remove signatures from a signed document", 403);
  }

  if (signature.status === "signed") {
    throw new AppError("Cannot remove an already-signed field", 403);
  }

  await SignatureModel.findByIdAndDelete(signatureId);
}

// ─── Update status (used on Day 9 by public signing) ─────────────────────

export async function updateSignatureStatus(
  input: UpdateSignatureStatusInput
): Promise<ISignatureDocument> {
  const signature = await SignatureModel.findOne({
    _id: input.signatureId,
    documentId: input.documentId,
  });

  if (!signature) {
    throw new AppError("Signature not found", 404);
  }

  signature.status = input.status;
  if (input.status === "signed") {
    signature.signedAt = new Date();
  }
  if (input.rejectionReason) {
    signature.rejectionReason = input.rejectionReason;
  }

  await signature.save();
  return signature;
}

// ─── Get all signatures for a document (internal — no owner check) ────────

export async function getSignaturesByDocument(
  documentId: string
): Promise<ISignatureDocument[]> {
  return SignatureModel.find({ documentId }).sort({ page: 1, createdAt: 1 });
}
