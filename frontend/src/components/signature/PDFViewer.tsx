import { useState, useRef, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// ─── Configure PDF.js worker ──────────────────────────────────────────────
// Use the worker bundled with react-pdf via CDN — no extra config needed
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ─── Types ────────────────────────────────────────────────────────────────

export interface PlacedField {
  x: number;
  y: number;
  page: number;
  pageWidth: number;
  pageHeight: number;
}

interface SignatureFieldOverlay {
  id: string;
  x: number;
  y: number;
  page: number;
  pageWidth: number;
  pageHeight: number;
  status: string;
}

interface PDFViewerProps {
  fileUrl: string;
  signatures: SignatureFieldOverlay[];
  isPlacingMode: boolean;
  onPlace: (field: PlacedField) => void;
  onRemoveSignature: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export function PDFViewer({
  fileUrl,
  signatures,
  isPlacingMode,
  onPlace,
  onRemoveSignature,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // Measure the rendered page dimensions once it renders
  const onPageRenderSuccess = useCallback(() => {
    if (pageRef.current) {
      const { width, height } = pageRef.current.getBoundingClientRect();
      setPageWidth(width);
      setPageHeight(height);
    }
    setIsLoading(false);
  }, []);

  // Click-to-place handler
  const handlePageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isPlacingMode || !pageRef.current) return;

      const rect = pageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      onPlace({
        x,
        y,
        page: currentPage,
        pageWidth: rect.width,
        pageHeight: rect.height,
      });
    },
    [isPlacingMode, currentPage, onPlace]
  );

  // Signatures on the current page
  const currentPageSigs = signatures.filter((s) => s.page === currentPage);

  return (
    <div className="flex flex-col h-full">
      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1 || isLoading}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm text-gray-600 tabular-nums">
            <span className="font-semibold text-gray-900">{currentPage}</span>
            <span className="mx-1 text-gray-300">/</span>
            {numPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages || isLoading}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {isPlacingMode && (
          <div className="flex items-center gap-1.5 text-xs text-brand-600 font-medium bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200 animate-pulse">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Click anywhere to place
          </div>
        )}
      </div>

      {/* ── PDF Canvas ────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-200 flex items-start justify-center p-6"
      >
        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Failed to load PDF</p>
            <p className="text-xs text-gray-400">{error}</p>
          </div>
        ) : (
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages: n }) => { setNumPages(n); setIsLoading(false); }}
            onLoadError={(err) => { setError(err.message); setIsLoading(false); }}
            loading={
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-400">Loading PDF…</p>
              </div>
            }
          >
            {/* Page wrapper — position:relative for overlay */}
            <div
              className={`relative shadow-xl ${isPlacingMode ? "cursor-crosshair" : "cursor-default"}`}
              ref={pageRef}
              onClick={handlePageClick}
            >
              <Page
                pageNumber={currentPage}
                width={Math.min(containerRef.current?.clientWidth ?? 700, 780) - 48}
                onRenderSuccess={onPageRenderSuccess}
                renderAnnotationLayer
                renderTextLayer
              />

              {/* Signature overlays */}
              {pageWidth > 0 &&
                currentPageSigs.map((sig) => {
                  // Re-scale stored coords to current rendered dimensions
                  const scaleX = pageWidth / sig.pageWidth;
                  const scaleY = pageHeight / sig.pageHeight;
                  const left = sig.x * scaleX;
                  const top = sig.y * scaleY;

                  return (
                    <div
                      key={sig.id}
                      className="absolute group"
                      style={{
                        left: `${left}px`,
                        top: `${top}px`,
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className={`
                          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                          border-2 shadow-md select-none whitespace-nowrap
                          transition-all duration-150
                          ${sig.status === "signed"
                            ? "bg-green-50 border-green-400 text-green-700"
                            : sig.status === "rejected"
                            ? "bg-red-50 border-red-400 text-red-700"
                            : "bg-brand-50 border-brand-400 text-brand-700"
                          }
                        `}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        {sig.status === "signed" ? "Signed" : "Sign here"}

                        {/* Remove button — only on pending */}
                        {sig.status === "pending" && (
                          <button
                            onClick={() => onRemoveSignature(sig.id)}
                            className="ml-1 opacity-0 group-hover:opacity-100 text-brand-400 hover:text-red-500 transition-all"
                            title="Remove field"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {/* Pin stem */}
                      <div className={`mx-auto w-0.5 h-2 ${sig.status === "signed" ? "bg-green-400" : "bg-brand-400"}`} />
                    </div>
                  );
                })}
            </div>
          </Document>
        )}
      </div>
    </div>
  );
}
