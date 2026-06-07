import mongoose, { Document, Schema, Types } from "mongoose";

// ─── Interface ────────────────────────────────────────────────────────────

export interface IRefreshToken {
  userId: Types.ObjectId;
  token: string;
  family: string;      // All tokens in a rotation chain share a family ID
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface IRefreshTokenDocument extends IRefreshToken, Document {}

// ─── Schema ───────────────────────────────────────────────────────────────

const refreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    family: {
      type: String,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ─── TTL index — MongoDB auto-deletes expired tokens ─────────────────────

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ family: 1 });

export const RefreshToken = mongoose.model<IRefreshTokenDocument>(
  "RefreshToken",
  refreshTokenSchema
);
