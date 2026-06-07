import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimiter.middleware";
import {
  validate,
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../middleware/validate.middleware";

const router = Router();

// Public routes — rate-limited
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  authController.login
);

router.post(
  "/refresh",
  validate(refreshSchema),
  authController.refresh
);

// Auth required
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
