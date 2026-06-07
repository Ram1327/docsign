import { Request } from "express";
import { Types } from "mongoose";

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// ─── Documents ────────────────────────────────────────────────────────────

export type DocumentStatus = "pending" | "signed" | "rejected";

export interface IDocumentBase {
  title: string;
  originalFileName: string;
  fileUrl: string;
  ownerId: Types.ObjectId;
  status: DocumentStatus;
  signedFileUrl?: string;
  isDeleted: boolean;
}

// ─── Signatures ───────────────────────────────────────────────────────────

export type SignatureStatus = "pending" | "signed" | "rejected";

export interface ISignatureBase {
  documentId: Types.ObjectId;
  signerId?: Types.ObjectId;
  signerEmail?: string;
  x: number;
  y: number;
  page: number;
  pageWidth: number;
  pageHeight: number;
  status: SignatureStatus;
  rejectionReason?: string;
  signedAt?: Date;
}

// ─── Audit ────────────────────────────────────────────────────────────────

export type AuditAction =
  | "upload"
  | "view"
  | "sign"
  | "reject"
  | "download"
  | "link_generated"
  | "link_opened"
  | "delete";

export interface IAuditLogBase {
  userId?: Types.ObjectId;
  documentId: Types.ObjectId;
  action: AuditAction;
  ipAddress: string;
  metadata?: Record<string, unknown>;
}

// ─── Signing Links ────────────────────────────────────────────────────────

export interface ISigningLinkBase {
  documentId: Types.ObjectId;
  token: string;
  signerEmail: string;
  expiresAt: Date;
  isUsed: boolean;
}

// ─── API Response ─────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
