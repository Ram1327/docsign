import mongoose, { Document, Schema, Types } from "mongoose";
import { SignatureStatus } from "../types";

// ─── Interface ────────────────────────────────────────────────────────────

export interface ISignature {
  documentId: Types.ObjectId;
  signerId?: Types.ObjectId;
  signerEmail?: string;
  // Coordinates stored as absolute pixels at capture time
  x: number;
  y: number;
  page: number;          // 1-indexed page number
  // Page dimensions at capture time — required for resolution-independent replay
  pageWidth: number;
  pageHeight: number;
  status: SignatureStatus;
  rejectionReason?: string;
  signedAt?: Date;
  createdAt: Date;
}

export interface ISignatureDocument extends ISignature, Document {}

// ─── Schema ───────────────────────────────────────────────────────────────

const signatureSchema = new Schema<ISignatureDocument>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    signerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    signerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    page: { type: Number, required: true, min: 1 },
    pageWidth: { type: Number, required: true },
    pageHeight: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "signed", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: null },
    signedAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────

signatureSchema.index({ documentId: 1 });
signatureSchema.index({ signerId: 1 });

export const SignatureModel = mongoose.model<ISignatureDocument>(
  "Signature",
  signatureSchema
);
