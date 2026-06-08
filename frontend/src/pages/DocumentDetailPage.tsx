import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { PDFViewer, PlacedField } from "@/components/signature/PDFViewer";
import { SignaturePanel } from "@/components/signature/SignaturePanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useSignatures } from "@/hooks/useSignatures";
import { usePDFBlob } from "@/hooks/usePDFBlob";
import { documentService } from "@/services/document.service";
import { formatDate, formatFileSize } from "@/utils/format";
import { Document } from "@/types";

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isPlacingMode, setIsPlacingMode] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [doc, setDoc] = useState<Document | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [docFetched, setDocFetched] = useState(false);

  // Fetch document metadata
  useEffect(() => {
    if (!id) return;
    documentService
      .getOne(id)
      .then(setDoc)
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Document not found";
        setDocError(msg);
      })
      .finally(() => setDocFetched(true));
  }, [id]);

  // Fetch PDF as authenticated blob — react-pdf can't attach auth headers itself
  const pdfApiPath = id ? `/documents/${id}/file` : "";
  const { blobUrl: fileUrl, isLoading: pdfLoading, error: pdfError } = usePDFBlob(pdfApiPath);

  const { signatures, isLoading: sigsLoading, addSignature, removeSignature } =
    useSignatures(id ?? "");

  const handlePlace = useCallback(
    async (field: PlacedField) => {
      if (!id) return;
      await addSignature({
        documentId: id,
        x: field.x,
        y: field.y,
        page: field.page,
        pageWidth: field.pageWidth,
        pageHeight: field.pageHeight,
      });
    },
    [id, addSignature]
  );

  const handleRemove = useCallback(
    async (sigId: string) => {
      await removeSignature(sigId);
    },
    [removeSignature]
  );

  const handleFinalize = async () => {
    toast("PDF finalize coming in Day 8 — signature fields saved ✓", {
      icon: "📄",
      duration: 4000,
    });
  };

  // ── Loading ────────────────────────────────────────────────────────────
  if (!docFetched) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading document…</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (docError || !doc) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
        <p className="text-sm text-red-500">{docError ?? "Document not found"}</p>
        <button className="btn-secondary text-sm" onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </button>
      </div>
    );
  }

  // Normalise to overlay shape
  const overlaySignatures = signatures.map((s) => ({
    id: s._id,
    x: s.x,
    y: s.y,
    page: s.page,
    pageWidth: s.pageWidth,
    pageHeight: s.pageHeight,
    status: s.status,
  }));

  return (
    <div className="flex flex-col h-screen overflow-hidden animate-fade-in">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="h-14 shrink-0 flex items-center gap-4 px-5 bg-white border-b border-gray-100 z-10">
        <Link
          to="/dashboard"
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="flex-1 min-w-0 flex items-center gap-3">
          <h1 className="text-sm font-semibold text-gray-900 truncate">{doc.title}</h1>
          <StatusBadge status={doc.status} />
        </div>

        <div className="hidden md:flex items-center gap-4 shrink-0 text-xs text-gray-400">
          <span>{formatFileSize(doc.fileSize)}</span>
          <span>{formatDate(doc.createdAt)}</span>
          <Link
            to={`/documents/${id}/audit`}
            className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            Audit trail →
          </Link>
        </div>
      </header>

      {/* ── Main layout ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF viewer */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-100 bg-gray-100">
          {pdfLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-400">Fetching PDF…</p>
              </div>
            </div>
          ) : pdfError ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-red-500">{pdfError}</p>
            </div>
          ) : fileUrl ? (
            <PDFViewer
              fileUrl={fileUrl}
              signatures={overlaySignatures}
              isPlacingMode={isPlacingMode}
              onPlace={handlePlace}
              onRemoveSignature={handleRemove}
            />
          ) : null}
        </div>

        {/* Signature panel */}
        <div className="w-72 shrink-0 flex flex-col bg-white overflow-hidden">
          <SignaturePanel
            signatures={signatures}
            isLoading={sigsLoading}
            isPlacingMode={isPlacingMode}
            documentStatus={doc.status}
            onTogglePlaceMode={() => setIsPlacingMode((p) => !p)}
            onRemove={handleRemove}
            onFinalize={handleFinalize}
            isFinalizing={isFinalizing}
          />
        </div>
      </div>
    </div>
  );
}
