import mongoose, { Document, Schema, Types } from "mongoose";
import { AuditAction } from "../types";

// ─── Interface ────────────────────────────────────────────────────────────

export interface IAuditLog {
  userId?: Types.ObjectId;
  documentId: Types.ObjectId;
  action: AuditAction;
  ipAddress: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface IAuditLogDocument extends IAuditLog, Document {}

// ─── Schema ───────────────────────────────────────────────────────────────

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "upload",
        "view",
        "sign",
        "reject",
        "download",
        "link_generated",
        "link_opened",
        "delete",
      ],
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
      default: "unknown",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    // No timestamps — we control the timestamp field ourselves
    timestamps: false,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────

auditLogSchema.index({ documentId: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1 });

export const AuditLog = mongoose.model<IAuditLogDocument>(
  "AuditLog",
  auditLogSchema
);
