import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { sendError } from "../utils/response.utils";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  // Known operational errors (e.g. 404, 403, validation failures)
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    return sendError(res, err.message, 400, "ValidationError");
  }

  // Mongoose duplicate key
  if (err.name === "MongoServerError" && (err as NodeJS.ErrnoException).code === 11000) {
    return sendError(res, "Duplicate field value", 409, "DuplicateKey");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid token", 401, "InvalidToken");
  }
  if (err.name === "TokenExpiredError") {
    return sendError(res, "Token expired", 401, "TokenExpired");
  }

  // Unknown / programmer errors — don't leak details in production
  console.error("Unhandled error:", err);
  return sendError(
    res,
    env.NODE_ENV === "production" ? "Internal server error" : err.message,
    500
  );
}

export function notFoundHandler(req: Request, res: Response): Response {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
}
