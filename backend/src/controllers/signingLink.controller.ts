import { Request, Response, NextFunction } from "express";
import * as signingLinkService from "../services/signingLink.service";
import { createAuditLog } from "../services/audit.service";
import { sendSuccess } from "../utils/response.utils";

function getIp(req: Request): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string") return fwd.split(",")[0].trim();
  return req.socket.remoteAddress ?? "unknown";
}

// ─── POST /api/signing-links/generate ────────────────────────────────────

export async function generate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { documentId, signerEmail } = req.body as {
      documentId: string;
      signerEmail: string;
    };

    const { link, url } = await signingLinkService.generateSigningLink({
      documentId,
      ownerId: req.user!.userId,
      signerEmail,
    });

    void createAuditLog({
      userId: req.user!.userId,
      documentId,
      action: "link_generated",
      ipAddress: getIp(req),
      metadata: { signerEmail, expiresAt: link.expiresAt },
    });

    sendSuccess(res, "Signing link generated", { link, url }, 201);
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/signing-links/validate/:token ───────────────────────────────

export async function validate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await signingLinkService.validateSigningToken(
      req.params.token
    );

    void createAuditLog({
      documentId: result.document._id,
      action: "link_opened",
      ipAddress: getIp(req),
      metadata: { signerEmail: result.link.signerEmail },
    });

    sendSuccess(res, "Token valid", result);
  } catch (error) {
    next(error);
  }
}

// ─── POST /api/signing-links/sign/:token ──────────────────────────────────

export async function signViaLink(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { action, rejectionReason } = req.body as {
      action: "sign" | "reject";
      rejectionReason?: string;
    };

    // Validate first to get documentId for audit
    const { document } = await signingLinkService.validateSigningToken(
      req.params.token
    );

    await signingLinkService.consumeSigningLink(
      req.params.token,
      action,
      rejectionReason
    );

    void createAuditLog({
      documentId: document._id,
      action: action === "sign" ? "sign" : "reject",
      ipAddress: getIp(req),
      metadata: { rejectionReason: rejectionReason ?? null },
    });

    sendSuccess(
      res,
      action === "sign"
        ? "Document signed successfully"
        : "Document rejected"
    );
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/signing-links/document/:docId ───────────────────────────────

export async function listForDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const links = await signingLinkService.listSigningLinks(
      req.params.docId,
      req.user!.userId
    );
    sendSuccess(res, "Signing links retrieved", links);
  } catch (error) {
    next(error);
  }
}
