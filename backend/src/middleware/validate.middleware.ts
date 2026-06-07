import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.utils";

// ─── Schemas ──────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .trim(),
    email: z
      .string({ required_error: "Email is required" })
      .email("Please provide a valid email address")
      .toLowerCase(),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Please provide a valid email address"),
    password: z.string({ required_error: "Password is required" }).min(1),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: "Refresh token is required" }),
  }),
});

// ─── Validation middleware factory ────────────────────────────────────────

type ZodSchema = z.ZodObject<{ body: z.ZodTypeAny }>;

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({ body: req.body });

    if (!result.success) {
      const firstError = result.error.errors[0];
      sendError(res, firstError.message, 400, "ValidationError");
      return;
    }

    // Attach parsed (type-safe, transformed) body back to req
    req.body = result.data.body as Record<string, unknown>;
    next();
  };
}
