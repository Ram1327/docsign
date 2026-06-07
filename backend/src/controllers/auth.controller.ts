import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { sendSuccess } from "../utils/response.utils";

// ─── POST /api/auth/register ──────────────────────────────────────────────

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    const { user, accessToken, refreshToken } = await authService.register({
      name,
      email,
      password,
    });

    sendSuccess(
      res,
      "Account created successfully",
      { user, accessToken, refreshToken },
      201
    );
  } catch (error) {
    next(error);
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const { user, accessToken, refreshToken } = await authService.login({
      email,
      password,
    });

    sendSuccess(res, "Login successful", { user, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
}

// ─── POST /api/auth/refresh ───────────────────────────────────────────────

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const tokens = await authService.refresh(refreshToken);
    sendSuccess(res, "Token refreshed", tokens);
  } catch (error) {
    next(error);
  }
}

// ─── POST /api/auth/logout ────────────────────────────────────────────────

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    sendSuccess(res, "Logged out successfully");
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────

export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.getCurrentUser(req.user!.userId);
    sendSuccess(res, "User retrieved", user);
  } catch (error) {
    next(error);
  }
}
