import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocuments } from "@/hooks/useDocuments";
import { DocumentCard } from "@/components/document/DocumentCard";
import { DocumentListSkeleton } from "@/components/document/DocumentSkeleton";
import { EmptyState } from "@/components/document/EmptyState";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Signed", value: "signed" },
  { label: "Rejected", value: "rejected" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Fetch filtered list
  const { documents, totalPages, isLoading, error, deleteDocument } =
    useDocuments({ page, limit: 9, status: statusFilter || undefined });

  // Fetch all (no filter) just for stats counts
  const { documents: allDocs, isLoading: statsLoading } = useDocuments({ limit: 200 });

  const stats = {
    total: allDocs.length,
    pending: allDocs.filter((d) => d.status === "pending").length,
    signed: allDocs.filter((d) => d.status === "signed").length,
    rejected: allDocs.filter((d) => d.status === "rejected").length,
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Documents</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and track all your PDFs
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/documents/upload")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Upload PDF
        </button>
      </div>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      {!statsLoading && allDocs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total", value: stats.total, color: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
            { label: "Pending", value: stats.pending, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
            { label: "Signed", value: stats.signed, color: "text-green-700", bg: "bg-green-50 border-green-200" },
            { label: "Rejected", value: stats.rejected, color: "text-red-700", bg: "bg-red-50 border-red-200" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-xl border px-4 py-3 ${bg}`}>
              <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Status filter tabs ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {STATUS_FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(1); }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              statusFilter === value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-6">
          {error}
        </div>
      )}

      {/* ── Document grid ────────────────────────────────────────────────── */}
      {isLoading ? (
        <DocumentListSkeleton count={9} />
      ) : documents.length === 0 ? (
        <EmptyState
          hasFilter={!!statusFilter}
          onClearFilter={() => setStatusFilter("")}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard key={doc._id} document={doc} onDelete={deleteDocument} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button className="btn-secondary text-xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button className="btn-secondary text-xs" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
