// ─── Auth ──────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Documents ────────────────────────────────────────────────────────────

export type DocumentStatus = "pending" | "signed" | "rejected";

export interface Document {
  _id: string;
  title: string;
  originalFileName: string;
  fileUrl: string;
  ownerId: string;
  status: DocumentStatus;
  signedFileUrl?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Signatures ───────────────────────────────────────────────────────────

export type SignatureStatus = "pending" | "signed" | "rejected";

export interface Signature {
  _id: string;
  documentId: string;
  signerId?: string;
  signerEmail?: string;
  x: number;
  y: number;
  page: number;
  pageWidth: number;
  pageHeight: number;
  status: SignatureStatus;
  rejectionReason?: string;
  signedAt?: string;
  createdAt: string;
}

export interface SignatureField {
  id: string; // temp client ID before saving
  x: number;
  y: number;
  page: number;
  pageWidth: number;
  pageHeight: number;
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

export interface AuditLog {
  _id: string;
  userId?: string;
  documentId: string;
  action: AuditAction;
  ipAddress: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  user?: Pick<User, "_id" | "name" | "email">;
}

// ─── Signing Links ────────────────────────────────────────────────────────

export interface SigningLink {
  _id: string;
  documentId: string;
  token: string;
  signerEmail: string;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────

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

// ─── Forms ────────────────────────────────────────────────────────────────

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
