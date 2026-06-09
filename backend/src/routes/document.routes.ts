import { Router } from "express";
import * as documentController from "../controllers/document.controller";
import { authenticate } from "../middleware/auth.middleware";
import { handleUpload } from "../middleware/upload.middleware";
import { uploadLimiter } from "../middleware/rateLimiter.middleware";
import { auditAction } from "../middleware/audit.middleware";

const router = Router();

router.use(authenticate);

// Upload — audit handled directly in controller (needs the created doc's _id)
router.post("/upload", uploadLimiter, handleUpload, documentController.upload);

// List — no audit (read-only, high frequency)
router.get("/", documentController.list);

// View single — audit "view"
router.get(
  "/:id",
  auditAction("view", (req) => req.params.id),
  documentController.getOne
);

// Soft delete — audit "delete"
router.delete(
  "/:id",
  auditAction("delete", (req) => req.params.id),
  documentController.remove
);

// File serving — audit "download"
router.get(
  "/:id/file",
  auditAction("download", (req) => req.params.id),
  documentController.serveFile
);
router.get(
  "/:id/signed-file",
  auditAction("download", (req) => req.params.id),
  documentController.serveFile
);

export default router;
