import { Router } from "express";
import * as documentController from "../controllers/document.controller";
import { authenticate } from "../middleware/auth.middleware";
import { handleUpload } from "../middleware/upload.middleware";
import { uploadLimiter } from "../middleware/rateLimiter.middleware";

const router = Router();

// All document routes require authentication
router.use(authenticate);

// Upload
router.post(
  "/upload",
  uploadLimiter,
  handleUpload,
  documentController.upload
);

// List all (owned, not deleted)
router.get("/", documentController.list);

// Get single document metadata
router.get("/:id", documentController.getOne);

// Soft delete
router.delete("/:id", documentController.remove);

// Protected file serving
router.get("/:id/file", documentController.serveFile);
router.get("/:id/signed-file", documentController.serveFile);

export default router;
