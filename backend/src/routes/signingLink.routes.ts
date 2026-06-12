import { Router } from "express";
import * as signingLinkController from "../controllers/signingLink.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Auth required
router.post("/generate", authenticate, signingLinkController.generate);
router.get("/document/:docId", authenticate, signingLinkController.listForDocument);

// Public — token-gated only
router.get("/validate/:token", signingLinkController.validate);
router.post("/sign/:token", signingLinkController.signViaLink);

export default router;
