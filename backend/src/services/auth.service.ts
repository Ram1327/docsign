import { env } from "../config/env";
import { User, IUserDocument } from "../models/User.model";
import { RefreshToken } from "../models/RefreshToken.model";
import { AppError } from "../middleware/errorHandler.middleware";
import { signAccessToken, parseExpiry } from "../utils/jwt.utils";
import { generateOpaqueToken, generateTokenFamily } from "../utils/token.utils";

// ─── Types ────────────────────────────────────────────────────────────────

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: IUserDocument;
  accessToken: string;
  refreshToken: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

async function createRefreshToken(
  userId: string,
  family: string
): Promise<string> {
  const token = generateOpaqueToken();
  const expiresAt = new Date(
    Date.now() + parseExpiry(env.JWT_REFRESH_EXPIRES_IN)
  );

  await RefreshToken.create({ userId, token, family, expiresAt });
  return token;
}

// ─── Register ─────────────────────────────────────────────────────────────

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const user = await User.create({
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    password: input.password,
  });

  const payload = { userId: String(user._id), email: user.email };
  const accessToken = signAccessToken(payload);
  const family = generateTokenFamily();
  const refreshToken = await createRefreshToken(String(user._id), family);

  return { user, accessToken, refreshToken };
}

// ─── Login ────────────────────────────────────────────────────────────────

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await User.findByEmail(input.email);

  // Deliberate: same error for "no account" and "wrong password"
  // Prevents email enumeration attacks
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const payload = { userId: String(user._id), email: user.email };
  const accessToken = signAccessToken(payload);
  const family = generateTokenFamily();
  const refreshToken = await createRefreshToken(String(user._id), family);

  return { user, accessToken, refreshToken };
}

// ─── Refresh ──────────────────────────────────────────────────────────────

export async function refresh(
  incomingToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const storedToken = await RefreshToken.findOne({ token: incomingToken });

  if (!storedToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  // Token reuse detected — revoke entire family (potential theft)
  if (storedToken.isRevoked) {
    await RefreshToken.updateMany(
      { family: storedToken.family },
      { isRevoked: true }
    );
    throw new AppError(
      "Refresh token reuse detected. Please log in again.",
      401
    );
  }

  if (storedToken.expiresAt < new Date()) {
    throw new AppError("Refresh token expired", 401);
  }

  // Rotate: revoke old, issue new in same family
  storedToken.isRevoked = true;
  await storedToken.save();

  const user = await User.findById(storedToken.userId);
  if (!user) {
    throw new AppError("User not found", 401);
  }

  const payload = { userId: String(user._id), email: user.email };
  const accessToken = signAccessToken(payload);
  const newRefreshToken = await createRefreshToken(
    String(user._id),
    storedToken.family
  );

  return { accessToken, refreshToken: newRefreshToken };
}

// ─── Logout ───────────────────────────────────────────────────────────────

export async function logout(refreshToken: string): Promise<void> {
  const stored = await RefreshToken.findOne({ token: refreshToken });
  if (!stored) return; // Already invalid — silently succeed

  // Revoke entire family on logout for maximum security
  await RefreshToken.updateMany(
    { family: stored.family },
    { isRevoked: true }
  );
}

// ─── Get current user ─────────────────────────────────────────────────────

export async function getCurrentUser(
  userId: string
): Promise<IUserDocument> {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}
