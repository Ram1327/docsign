import mongoose, { Document, Schema, Types } from "mongoose";
import { DocumentStatus } from "../types";

// ─── Interface ────────────────────────────────────────────────────────────

export interface IDocument {
  title: string;
  originalFileName: string;
  fileUrl: string;            // relative path from UPLOAD_DIR
  mimeType: string;
  fileSize: number;           // bytes
  ownerId: Types.ObjectId;
  status: DocumentStatus;
  signedFileUrl?: string;     // set after finalize (Day 8)
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocumentDocument extends IDocument, Document {}

// ─── Schema ───────────────────────────────────────────────────────────────

const documentSchema = new Schema<IDocumentDocument>(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    originalFileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "signed", "rejected"],
      default: "pending",
    },
    signedFileUrl: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────

documentSchema.index({ ownerId: 1, isDeleted: 1, createdAt: -1 });
documentSchema.index({ status: 1 });

export const DocumentModel = mongoose.model<IDocumentDocument>(
  "Document",
  documentSchema
);
