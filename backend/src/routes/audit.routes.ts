import { Router } from "express";
import * as auditController from "../controllers/audit.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/:docId", auditController.getTrail);

export default router;
