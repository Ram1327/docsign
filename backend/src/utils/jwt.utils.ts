import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { JwtPayload } from "../types";

// ─── Access token (short-lived: 15m) ──────────────────────────────────────

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    issuer: "docsign",
    audience: "docsign-client",
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: "docsign",
    audience: "docsign-client",
  }) as JwtPayload;
}

// ─── Refresh token (long-lived: 7d) ───────────────────────────────────────

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: "docsign",
    audience: "docsign-refresh",
  } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: "docsign",
    audience: "docsign-refresh",
  }) as JwtPayload;
}

// ─── Parse expiry string to milliseconds ─────────────────────────────────

export function parseExpiry(expiry: string): number {
  const unit = expiry.slice(-1);
  const value = parseInt(expiry.slice(0, -1), 10);
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * (multipliers[unit] ?? 1000);
}
