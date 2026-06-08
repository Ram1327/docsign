import { Router } from "express";
import * as signatureController from "../controllers/signature.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", signatureController.create);
router.get("/document/:docId", signatureController.listByDocument);
router.delete("/:id", signatureController.remove);

export default router;
