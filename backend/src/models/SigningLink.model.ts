import mongoose, { Document, Schema, Types } from "mongoose";

// ─── Interface ────────────────────────────────────────────────────────────

export interface ISigningLink {
  documentId: Types.ObjectId;
  token: string;
  signerEmail: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

export interface ISigningLinkDocument extends ISigningLink, Document {}

// ─── Schema ───────────────────────────────────────────────────────────────

const signingLinkSchema = new Schema<ISigningLinkDocument>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    signerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
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

// TTL index — MongoDB auto-deletes expired links after 1 day grace period
signingLinkSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 86400 }
);
signingLinkSchema.index({ token: 1 });
signingLinkSchema.index({ documentId: 1 });

export const SigningLink = mongoose.model<ISigningLinkDocument>(
  "SigningLink",
  signingLinkSchema
);
