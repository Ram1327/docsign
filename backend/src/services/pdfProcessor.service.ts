import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { ISignatureDocument } from "../models/Signature.model";
import { readFileBuffer } from "./storage.service";

// ─── Types ────────────────────────────────────────────────────────────────

export interface EmbedSignaturesInput {
  fileUrl: string; // relative path stored in DB
  signatures: ISignatureDocument[];
  signerName?: string;
}

export interface EmbedSignaturesResult {
  buffer: Buffer;
  pageCount: number;
}

// ─── Main embed function ──────────────────────────────────────────────────

export async function embedSignatures(
  input: EmbedSignaturesInput
): Promise<EmbedSignaturesResult> {
  const { fileUrl, signatures, signerName } = input;

  // Load original PDF
  const originalBytes = await readFileBuffer(fileUrl);
  const pdfDoc = await PDFDocument.load(originalBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontLight = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const signedAt = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  for (const sig of signatures) {
    if (sig.status !== "signed") continue;

    // Pages are 0-indexed in PDF-Lib, stored 1-indexed in DB
    const pageIndex = sig.page - 1;
    if (pageIndex < 0 || pageIndex >= pages.length) continue;

    const page = pages[pageIndex];
    const { width: pdfWidth, height: pdfHeight } = page.getSize();

    // Scale stored coordinates to actual PDF page dimensions
    // Stored coords are relative to the rendered page in the browser
    const scaleX = pdfWidth / sig.pageWidth;
    const scaleY = pdfHeight / sig.pageHeight;

    // PDF-Lib origin is bottom-left; browser origin is top-left — flip Y
    const x = sig.x * scaleX;
    const y = pdfHeight - sig.y * scaleY;

    // ── Signature box dimensions ──────────────────────────────────────
    const boxWidth = 160;
    const boxHeight = 52;
    const boxX = Math.min(x - boxWidth / 2, pdfWidth - boxWidth - 4);
    const boxY = Math.max(y - boxHeight / 2, 4);

    // Background fill
    page.drawRectangle({
      x: boxX,
      y: boxY,
      width: boxWidth,
      height: boxHeight,
      color: rgb(0.96, 1.0, 0.97),
      opacity: 0.95,
    });

    // Border
    page.drawRectangle({
      x: boxX,
      y: boxY,
      width: boxWidth,
      height: boxHeight,
      borderColor: rgb(0.13, 0.77, 0.37),
      borderWidth: 1.2,
      opacity: 0,
    });

    // ✓ checkmark
    page.drawText("✓", {
      x: boxX + 6,
      y: boxY + boxHeight - 16,
      size: 11,
      font,
      color: rgb(0.05, 0.6, 0.2),
    });

    // "Digitally signed" label
    page.drawText("Digitally signed", {
      x: boxX + 20,
      y: boxY + boxHeight - 14,
      size: 7,
      font,
      color: rgb(0.05, 0.6, 0.2),
    });

    // Signer name or email
    const displayName =
      signerName ??
      sig.signerEmail ??
      "Signed";
    const nameText =
      displayName.length > 22
        ? displayName.slice(0, 22) + "…"
        : displayName;

    page.drawText(nameText, {
      x: boxX + 6,
      y: boxY + boxHeight - 26,
      size: 9,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Timestamp
    page.drawText(signedAt, {
      x: boxX + 6,
      y: boxY + 8,
      size: 6.5,
      font: fontLight,
      color: rgb(0.45, 0.45, 0.45),
    });
  }

  // Add a certification page at the end
  await appendCertificationPage(pdfDoc, signatures, signedAt, font, fontLight);

  const pdfBytes = await pdfDoc.save();

  return {
    buffer: Buffer.from(pdfBytes),
    pageCount: pages.length,
  };
}

// ─── Certification page ───────────────────────────────────────────────────

async function appendCertificationPage(
  pdfDoc: PDFDocument,
  signatures: ISignatureDocument[],
  signedAt: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  fontLight: Awaited<ReturnType<PDFDocument["embedFont"]>>
): Promise<void> {
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  // Header bar
  page.drawRectangle({
    x: 0,
    y: height - 60,
    width,
    height: 60,
    color: rgb(0.24, 0.27, 0.96),
  });

  page.drawText("DocSign — Signature Certificate", {
    x: 40,
    y: height - 38,
    size: 16,
    font,
    color: rgb(1, 1, 1),
  });

  page.drawText("This document certifies the digital signatures applied to this PDF", {
    x: 40,
    y: height - 52,
    size: 7.5,
    font: fontLight,
    color: rgb(0.85, 0.85, 1),
  });

  // Signature records
  let yPos = height - 100;
  const signedSigs = signatures.filter((s) => s.status === "signed");

  page.drawText(`Total signatures: ${signedSigs.length}`, {
    x: 40,
    y: yPos,
    size: 9,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  yPos -= 24;

  for (let i = 0; i < signedSigs.length; i++) {
    const sig = signedSigs[i];

    // Row background
    page.drawRectangle({
      x: 36,
      y: yPos - 16,
      width: width - 72,
      height: 44,
      color: rgb(0.97, 0.98, 1),
      borderColor: rgb(0.85, 0.88, 0.96),
      borderWidth: 0.5,
    });

    page.drawText(`Signature ${i + 1}`, {
      x: 46,
      y: yPos + 12,
      size: 8,
      font,
      color: rgb(0.24, 0.27, 0.8),
    });

    page.drawText(`Page: ${sig.page}`, {
      x: 46,
      y: yPos,
      size: 7.5,
      font: fontLight,
      color: rgb(0.3, 0.3, 0.3),
    });

    if (sig.signerEmail) {
      page.drawText(`Signer: ${sig.signerEmail}`, {
        x: 46,
        y: yPos - 12,
        size: 7.5,
        font: fontLight,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    page.drawText(`Signed at: ${signedAt}`, {
      x: 300,
      y: yPos,
      size: 7.5,
      font: fontLight,
      color: rgb(0.4, 0.4, 0.4),
    });

    yPos -= 60;
    if (yPos < 80) break;
  }

  // Footer
  page.drawText(`Generated by DocSign · ${signedAt}`, {
    x: 40,
    y: 30,
    size: 7,
    font: fontLight,
    color: rgb(0.6, 0.6, 0.6),
  });
}
