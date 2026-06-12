import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { signingLinkService, ValidateTokenResult } from "@/services/signingLink.service";
import { usePDFBlob } from "@/hooks/usePDFBlob";
import { PDFViewer } from "@/components/signature/PDFViewer";

type PageState = "loading" | "valid" | "invalid" | "expired" | "used" | "done";

export default function PublicSignPage() {
  const { token } = useParams<{ token: string }>();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [data, setData] = useState<ValidateTokenResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [doneAction, setDoneAction] = useState<"sign" | "reject">("sign");

  // Validate token on mount
  useEffect(() => {
    if (!token) { setPageState("invalid"); return; }

    signingLinkService
      .validate(token)
      .then((result) => {
        setData(result);
        setPageState("valid");
      })
      .catch((err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Invalid link";
        setErrorMsg(msg);
        if (status === 410) {
          setPageState(msg.includes("used") ? "used" : "expired");
        } else {
          setPageState("invalid");
        }
      });
  }, [token]);

  // Fetch PDF through our API (needs auth bypass — use public endpoint path)
  // For public signing we use direct URL with token in query (backend handles this)
  // For now we use the same blob pattern — the validate endpoint confirmed access
  const pdfPath = data ? `/signing-links/pdf/${token}` : "";

  const handleSign = async () => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      await signingLinkService.signViaLink(token, "sign");
      setDoneAction("sign");
      setPageState("done");
      toast.success("Document signed successfully!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to sign";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!token || !rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setIsSubmitting(true);
    try {
      await signingLinkService.signViaLink(token, "reject", rejectReason.trim());
      setDoneAction("reject");
      setPageState("done");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to reject";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Shell layout ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 h-14 flex items-center px-6 gap-3 shrink-0">
        <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <span className="font-bold text-gray-900 tracking-tight">DocSign</span>
        {data && (
          <span className="ml-auto text-sm text-gray-500 truncate max-w-xs">
            {data.document.title}
          </span>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">

        {/* Loading */}
        {pageState === "loading" && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Validating signing link…</p>
          </div>
        )}

        {/* Error states */}
        {(pageState === "invalid" || pageState === "expired" || pageState === "used") && (
          <div className="text-center max-w-sm">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
              pageState === "used" ? "bg-amber-100" : "bg-red-100"
            }`}>
              <svg className={`w-7 h-7 ${pageState === "used" ? "text-amber-600" : "text-red-500"}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={pageState === "used"
                    ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  }
                />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              {pageState === "used" ? "Already signed" : pageState === "expired" ? "Link expired" : "Invalid link"}
            </h2>
            <p className="text-sm text-gray-500">{errorMsg}</p>
          </div>
        )}

        {/* Done */}
        {pageState === "done" && (
          <div className="text-center max-w-sm animate-slide-up">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${
              doneAction === "sign" ? "bg-green-100" : "bg-red-100"
            }`}>
              <svg className={`w-8 h-8 ${doneAction === "sign" ? "text-green-600" : "text-red-500"}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={doneAction === "sign" ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {doneAction === "sign" ? "Document signed!" : "Document rejected"}
            </h2>
            <p className="text-sm text-gray-500">
              {doneAction === "sign"
                ? "Your signature has been recorded. The document owner has been notified."
                : "You have rejected this document. The owner has been notified."}
            </p>
          </div>
        )}

        {/* Valid — signing UI */}
        {pageState === "valid" && data && (
          <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-6 animate-fade-in">
            {/* Document info + actions */}
            <div className="lg:w-80 shrink-0 flex flex-col gap-4">
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-1">
                  You've been asked to sign
                </h2>
                <p className="text-base font-bold text-gray-900 truncate">
                  {data.document.title}
                </p>
                <p className="text-xs text-gray-400 mt-1 truncate">
                  {data.document.originalFileName}
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {data.signatures.length} signature field{data.signatures.length !== 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {data.link.signerEmail}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {!showRejectForm ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSign}
                    disabled={isSubmitting}
                    className="btn-primary w-full justify-center py-3"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Signing…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        Sign document
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={isSubmitting}
                    className="btn-secondary w-full justify-center text-red-600 hover:bg-red-50 hover:border-red-200"
                  >
                    Decline to sign
                  </button>
                </div>
              ) : (
                <div className="card p-4 flex flex-col gap-3">
                  <p className="text-sm font-medium text-gray-700">
                    Reason for declining
                  </p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please explain why you are declining…"
                    rows={3}
                    className="input resize-none text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleReject}
                      disabled={isSubmitting || !rejectReason.trim()}
                      className="btn-danger flex-1 justify-center"
                    >
                      {isSubmitting ? "Submitting…" : "Submit rejection"}
                    </button>
                    <button
                      onClick={() => setShowRejectForm(false)}
                      className="btn-secondary"
                      disabled={isSubmitting}
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-gray-400 text-center leading-relaxed px-2">
                By clicking "Sign document" you agree this constitutes your legally binding digital signature.
              </p>
            </div>

            {/* PDF preview (read only for public signing) */}
            <div className="flex-1 card overflow-hidden min-h-[500px]">
              <div className="h-full flex items-center justify-center bg-gray-50 p-4">
                <p className="text-sm text-gray-400">
                  PDF preview available for authenticated document owners.
                  Review the document title and field count above before signing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
