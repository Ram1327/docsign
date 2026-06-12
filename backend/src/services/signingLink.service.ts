import { SigningLink, ISigningLinkDocument } from "../models/SigningLink.model";
import { DocumentModel } from "../models/Document.model";
import { SignatureModel } from "../models/Signature.model";
import { AppError } from "../middleware/errorHandler.middleware";
import { generateOpaqueToken } from "../utils/token.utils";
import { env } from "../config/env";

// ─── Types ────────────────────────────────────────────────────────────────

export interface GenerateLinkInput {
  documentId: string;
  ownerId: string;
  signerEmail: string;
}

export interface ValidateLinkResult {
  link: ISigningLinkDocument;
  document: {
    _id: string;
    title: string;
    originalFileName: string;
    status: string;
    fileUrl: string;
  };
  signatures: Array<{
    _id: string;
    x: number;
    y: number;
    page: number;
    pageWidth: number;
    pageHeight: number;
    status: string;
  }>;
}

// ─── Generate ─────────────────────────────────────────────────────────────

export async function generateSigningLink(
  input: GenerateLinkInput
): Promise<{ link: ISigningLinkDocument; url: string }> {
  const doc = await DocumentModel.findOne({
    _id: input.documentId,
    ownerId: input.ownerId,
    isDeleted: false,
  });

  if (!doc) throw new AppError("Document not found or access denied", 404);
  if (doc.status === "signed")
    throw new AppError("Document is already signed", 400);

  const token = generateOpaqueToken();
  const expiresAt = new Date(
    Date.now() + env.SIGNING_LINK_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  );

  const link = await SigningLink.create({
    documentId: input.documentId,
    token,
    signerEmail: input.signerEmail,
    expiresAt,
  });

  const url = `${env.FRONTEND_URL}/sign/${token}`;

  return { link, url };
}

// ─── Validate token ───────────────────────────────────────────────────────

export async function validateSigningToken(
  token: string
): Promise<ValidateLinkResult> {
  const link = await SigningLink.findOne({ token });

  if (!link) throw new AppError("Invalid or expired signing link", 404);
  if (link.isUsed) throw new AppError("This signing link has already been used", 410);
  if (link.expiresAt < new Date())
    throw new AppError("This signing link has expired", 410);

  const doc = await DocumentModel.findOne({
    _id: link.documentId,
    isDeleted: false,
  });
  if (!doc) throw new AppError("Document no longer exists", 404);
  if (doc.status === "signed")
    throw new AppError("Document is already signed", 400);

  const signatures = await SignatureModel.find({
    documentId: link.documentId,
    status: "pending",
  }).sort({ page: 1 });

  return {
    link,
    document: {
      _id: String(doc._id),
      title: doc.title,
      originalFileName: doc.originalFileName,
      status: doc.status,
      fileUrl: doc.fileUrl,
    },
    signatures: signatures.map((s) => ({
      _id: String(s._id),
      x: s.x,
      y: s.y,
      page: s.page,
      pageWidth: s.pageWidth,
      pageHeight: s.pageHeight,
      status: s.status,
    })),
  };
}

// ─── Consume — sign via public link ───────────────────────────────────────

export async function consumeSigningLink(
  token: string,
  action: "sign" | "reject",
  rejectionReason?: string
): Promise<void> {
  const link = await SigningLink.findOne({ token });
  if (!link) throw new AppError("Invalid signing link", 404);
  if (link.isUsed) throw new AppError("This link has already been used", 410);
  if (link.expiresAt < new Date())
    throw new AppError("This signing link has expired", 410);

  const newStatus = action === "sign" ? "signed" : "rejected";

  // Update all pending signature fields on this document
  await SignatureModel.updateMany(
    { documentId: link.documentId, status: "pending" },
    {
      status: newStatus,
      signedAt: action === "sign" ? new Date() : undefined,
      rejectionReason: rejectionReason ?? null,
      signerEmail: link.signerEmail,
    }
  );

  // Mark link as used
  link.isUsed = true;
  await link.save();

  // Update document status
  await DocumentModel.findByIdAndUpdate(link.documentId, {
    status: newStatus,
  });
}

// ─── List links for a document ────────────────────────────────────────────

export async function listSigningLinks(
  documentId: string,
  ownerId: string
): Promise<ISigningLinkDocument[]> {
  const doc = await DocumentModel.findOne({
    _id: documentId,
    ownerId,
    isDeleted: false,
  });
  if (!doc) throw new AppError("Document not found or access denied", 404);

  return SigningLink.find({ documentId }).sort({ createdAt: -1 });
}
