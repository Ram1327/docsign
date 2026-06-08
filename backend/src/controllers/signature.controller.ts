import { Request, Response, NextFunction } from "express";
import * as signatureService from "../services/signature.service";
import { sendSuccess } from "../utils/response.utils";

// ─── POST /api/signatures ─────────────────────────────────────────────────

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      documentId,
      signerEmail,
      x,
      y,
      page,
      pageWidth,
      pageHeight,
    } = req.body as {
      documentId: string;
      signerEmail?: string;
      x: number;
      y: number;
      page: number;
      pageWidth: number;
      pageHeight: number;
    };

    const signature = await signatureService.createSignature({
      documentId,
      ownerId: req.user!.userId,
      signerEmail,
      x,
      y,
      page,
      pageWidth,
      pageHeight,
    });

    sendSuccess(res, "Signature field created", signature, 201);
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/signatures/document/:docId ─────────────────────────────────

export async function listByDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const signatures = await signatureService.listSignatures(
      req.params.docId,
      req.user!.userId
    );
    sendSuccess(res, "Signatures retrieved", signatures);
  } catch (error) {
    next(error);
  }
}

// ─── DELETE /api/signatures/:id ───────────────────────────────────────────

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await signatureService.deleteSignature(req.params.id, req.user!.userId);
    sendSuccess(res, "Signature field removed");
  } catch (error) {
    next(error);
  }
}
