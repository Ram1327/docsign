import { v4 as uuidv4 } from "uuid";

/**
 * Generates a cryptographically random opaque token string.
 * Used for refresh tokens — JWTs are NOT used as refresh tokens
 * because we need server-side revocation capability.
 */
export function generateOpaqueToken(): string {
  return uuidv4().replace(/-/g, "") + uuidv4().replace(/-/g, "");
}

/**
 * Generates a family ID that links all rotation descendants of a
 * refresh token. If any token in the family is replayed after rotation,
 * the entire family is revoked (token theft detection).
 */
export function generateTokenFamily(): string {
  return uuidv4();
}
