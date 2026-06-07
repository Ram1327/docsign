import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Document } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatFileSize } from "@/utils/format";

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => Promise<void>;
}

export function DocumentCard({ document: doc, onDelete }: DocumentCardProps) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      await onDelete(doc._id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div
      className="card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
      onClick={() => navigate(`/documents/${doc._id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* PDF icon */}
          <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
              {doc.title}
            </p>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {doc.originalFileName}
            </p>
          </div>
        </div>
        <StatusBadge status={doc.status} />
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-gray-400 mt-4 pt-3 border-t border-gray-50">
        <span>{formatFileSize(doc.fileSize)}</span>
        <span>{formatDate(doc.createdAt)}</span>
      </div>

      {/* Delete action — appears on hover */}
      {doc.status !== "signed" && (
        <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${
              confirmDelete
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "text-gray-400 hover:text-red-500 hover:bg-red-50"
            }`}
          >
            {deleting ? "Deleting…" : confirmDelete ? "Confirm delete?" : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}
