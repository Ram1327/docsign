import { useState } from "react";
import { Signature } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface SignaturePanelProps {
  signatures: Signature[];
  isLoading: boolean;
  isPlacingMode: boolean;
  documentStatus: string;
  onTogglePlaceMode: () => void;
  onRemove: (id: string) => Promise<void>;
  onFinalize: () => void;
  onSendForSigning: () => void;
  isFinalizing: boolean;
}

export function SignaturePanel({
  signatures,
  isLoading,
  isPlacingMode,
  documentStatus,
  onTogglePlaceMode,
  onRemove,
  onFinalize,
  onSendForSigning,
  isFinalizing,
}: SignaturePanelProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const pendingCount = signatures.filter((s) => s.status === "pending").length;
  const canFinalize = signatures.length > 0 && documentStatus === "pending";

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try { await onRemove(id); } finally { setRemovingId(null); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Signature fields</h3>
          {signatures.length > 0 && (
            <span className="text-xs text-gray-400 tabular-nums">
              {signatures.length} field{signatures.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {documentStatus === "pending" && (
          <button
            onClick={onTogglePlaceMode}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border-2 border-dashed transition-all duration-150 ${
              isPlacingMode
                ? "border-brand-400 bg-brand-50 text-brand-700"
                : "border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/50"
            }`}
          >
            {isPlacingMode ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel placement
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Place signature field
              </>
            )}
          </button>
        )}
      </div>

      {/* Field list */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-lg" />
          ))
        ) : signatures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {documentStatus === "pending"
                ? "Click \"Place signature field\" then click anywhere on the PDF"
                : "No signature fields"}
            </p>
          </div>
        ) : (
          signatures.map((sig, i) => (
            <div key={sig._id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 group">
              <div className="w-7 h-7 rounded-md bg-brand-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-brand-600">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700">Page {sig.page}</p>
                <p className="text-[11px] text-gray-400 truncate">
                  {sig.signerEmail ?? "No signer assigned"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={sig.status} />
                {sig.status === "pending" && documentStatus === "pending" && (
                  <button
                    onClick={() => handleRemove(sig._id)}
                    disabled={removingId === sig._id}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions footer */}
      {canFinalize && (
        <div className="p-4 border-t border-gray-100 shrink-0 flex flex-col gap-2">
          {pendingCount > 0 && (
            <p className="text-xs text-amber-600 flex items-center gap-1.5 mb-1">
              <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {pendingCount} field{pendingCount !== 1 ? "s" : ""} pending
            </p>
          )}

          {/* Send for external signing */}
          <button
            onClick={onSendForSigning}
            className="w-full btn-secondary justify-center text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            Send signing link
          </button>

          {/* Self-finalize */}
          <button
            onClick={onFinalize}
            disabled={isFinalizing}
            className="w-full btn-primary justify-center"
          >
            {isFinalizing ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Finalizing…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Finalize & sign now
              </>
            )}
          </button>
        </div>
      )}

      {documentStatus === "signed" && (
        <div className="p-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium">Document fully signed</span>
          </div>
        </div>
      )}

      {documentStatus === "rejected" && (
        <div className="p-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium">Document was rejected</span>
          </div>
        </div>
      )}
    </div>
  );
}
