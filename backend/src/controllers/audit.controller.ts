import { Request, Response, NextFunction } from "express";
import * as auditService from "../services/audit.service";
import * as documentService from "../services/document.service";
import { sendSuccess } from "../utils/response.utils";

// ─── GET /api/audit/:docId ────────────────────────────────────────────────

export async function getTrail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Verify the requesting user owns the document
    await documentService.getDocument(req.params.docId, req.user!.userId);

    const logs = await auditService.getAuditTrail(req.params.docId);
    sendSuccess(res, "Audit trail retrieved", logs);
  } catch (error) {
    next(error);
  }
}
