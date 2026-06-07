import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.utils";
import { AppError } from "./errorHandler.middleware";

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("No token provided", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}

/**
 * Optional auth — attaches user if token present but doesn't block if missing.
 * Used for routes accessible to both authenticated and public users (e.g. public sign page).
 */
export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = verifyAccessToken(token);
  } catch {
    // Silently ignore invalid token for optional auth
  }

  next();
}
