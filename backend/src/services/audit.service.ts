import { AuditLog, IAuditLogDocument } from "../models/AuditLog.model";
import { AuditAction } from "../types";
import { Types } from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────

export interface CreateAuditLogInput {
  userId?: string;
  documentId: string;
  action: AuditAction;
  ipAddress: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogWithUser extends Omit<IAuditLogDocument, "userId"> {
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
}

// ─── Create ───────────────────────────────────────────────────────────────

export async function createAuditLog(
  input: CreateAuditLogInput
): Promise<void> {
  try {
    await AuditLog.create({
      userId: input.userId ? new Types.ObjectId(input.userId) : null,
      documentId: new Types.ObjectId(input.documentId),
      action: input.action,
      ipAddress: input.ipAddress,
      metadata: input.metadata ?? null,
      timestamp: new Date(),
    });
  } catch (err) {
    // Audit logging must NEVER crash the main request flow
    console.error("Audit log write failed (non-fatal):", err);
  }
}

// ─── Get trail for a document ─────────────────────────────────────────────

export async function getAuditTrail(
  documentId: string
): Promise<AuditLogWithUser[]> {
  const logs = await AuditLog.find({ documentId })
    .sort({ timestamp: -1 })
    .populate<{ userId: { _id: string; name: string; email: string } | null }>(
      "userId",
      "name email"
    )
    .lean();

  return logs as unknown as AuditLogWithUser[];
}
