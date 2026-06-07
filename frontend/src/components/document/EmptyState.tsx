import { useNavigate } from "react-router-dom";

interface EmptyStateProps {
  hasFilter?: boolean;
  onClearFilter?: () => void;
}

export function EmptyState({ hasFilter, onClearFilter }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-20 h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-100 rounded-full border-2 border-white flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {hasFilter ? (
        <>
          <p className="text-gray-700 font-semibold text-sm">No documents match this filter</p>
          <p className="text-gray-400 text-xs mt-1 mb-4">
            Try a different status or clear the filter
          </p>
          <button className="btn-secondary text-xs" onClick={onClearFilter}>
            Clear filter
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-700 font-semibold text-sm">No documents yet</p>
          <p className="text-gray-400 text-xs mt-1 mb-5">
            Upload your first PDF to get started
          </p>
          <button
            className="btn-primary text-sm"
            onClick={() => navigate("/documents/upload")}
          >
            Upload document
          </button>
        </>
      )}
    </div>
  );
}
