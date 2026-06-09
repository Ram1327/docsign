import { Request, Response, NextFunction } from "express";
import { createAuditLog } from "../services/audit.service";
import { AuditAction } from "../types";

// ─── IP extraction helper ─────────────────────────────────────────────────

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}

// ─── Audit middleware factory ─────────────────────────────────────────────
//
// Usage: router.get("/:id", auditAction("view", getDocId), controller.getOne)
//
// getDocId: extract the documentId from the request — varies by route.
// The audit write fires AFTER the response is sent successfully (statusCode < 400).
// This keeps audit logging completely decoupled from controller logic.

export function auditAction(
  action: AuditAction,
  getDocumentId: (req: Request) => string | undefined
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Intercept res.json to capture the response status
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown) {
      const result = originalJson(body);

      // Only log successful responses
      if (res.statusCode < 400) {
        const documentId = getDocumentId(req);
        if (documentId) {
          void createAuditLog({
            userId: req.user?.userId,
            documentId,
            action,
            ipAddress: getClientIp(req),
            metadata: buildMetadata(action, req, body),
          });
        }
      }

      return result;
    };

    next();
  };
}

// ─── Build contextual metadata per action type ────────────────────────────

function buildMetadata(
  action: AuditAction,
  req: Request,
  body: unknown
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    userAgent: req.headers["user-agent"]?.slice(0, 100),
  };

  switch (action) {
    case "upload": {
      const file = req.file;
      if (file) {
        base.fileName = file.originalname;
        base.fileSize = file.size;
        base.mimeType = file.mimetype;
      }
      break;
    }
    case "sign":
    case "reject": {
      const b = body as { data?: { status?: string; rejectionReason?: string } };
      if (b?.data?.rejectionReason) {
        base.rejectionReason = b.data.rejectionReason;
      }
      break;
    }
    case "download": {
      base.fileType = req.path.includes("signed") ? "signed" : "original";
      break;
    }
    default:
      break;
  }

  return base;
}
