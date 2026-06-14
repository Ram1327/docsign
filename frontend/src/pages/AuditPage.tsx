import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { auditService } from "@/services/audit.service";
import { documentService } from "@/services/document.service";
import { AuditLog, Document, AuditAction } from "@/types";
import { formatDateTime } from "@/utils/format";
import { StatusBadge } from "@/components/ui/StatusBadge";

// ─── Action config ────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<
  AuditAction,
  { label: string; icon: string; color: string; bg: string }
> = {
  upload: {
    label: "Document uploaded",
    icon: "⬆",
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  view: {
    label: "Document viewed",
    icon: "👁",
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
  sign: {
    label: "Document signed",
    icon: "✍",
    color: "text-green-700",
    bg: "bg-green-100",
  },
  reject: {
    label: "Document rejected",
    icon: "✕",
    color: "text-red-700",
    bg: "bg-red-100",
  },
  download: {
    label: "Document downloaded",
    icon: "⬇",
    color: "text-purple-700",
    bg: "bg-purple-100",
  },
  link_generated: {
    label: "Signing link created",
    icon: "🔗",
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  link_opened: {
    label: "Signing link opened",
    icon: "🔓",
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  delete: {
    label: "Document deleted",
    icon: "🗑",
    color: "text-red-700",
    bg: "bg-red-100",
  },
};

// ─── Component ────────────────────────────────────────────────────────────

export default function AuditPage() {
  const { id } = useParams<{ id: string }>();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [doc, setDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      auditService.getTrail(id),
      documentService.getOne(id),
    ])
      .then(([auditLogs, document]) => {
        setLogs(auditLogs);
        setDoc(document);
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Failed to load audit trail";
        setError(msg);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <Link
          to={`/documents/${id}`}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to document
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Audit trail
            </h1>
            {doc && (
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-sm text-gray-500 truncate max-w-xs">{doc.title}</p>
                <StatusBadge status={doc.status} />
              </div>
            )}
          </div>
          {!isLoading && (
            <span className="text-xs text-gray-400 mt-1 shrink-0 tabular-nums">
              {logs.length} event{logs.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-6">
          {error}
        </div>
      )}

      {/* ── Loading skeletons ────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex flex-col gap-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 pb-6">
              <div className="flex flex-col items-center">
                <div className="skeleton w-8 h-8 rounded-full" />
                {i < 4 && <div className="skeleton w-0.5 h-full mt-2 min-h-[40px]" />}
              </div>
              <div className="flex-1 pb-2 flex flex-col gap-2 pt-1">
                <div className="skeleton h-3.5 w-40 rounded" />
                <div className="skeleton h-2.5 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!isLoading && !error && logs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">No events recorded yet</p>
          <p className="text-xs text-gray-400">Actions on this document will appear here</p>
        </div>
      )}

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      {!isLoading && logs.length > 0 && (
        <div className="relative">
          {logs.map((log, index) => {
            const config = ACTION_CONFIG[log.action] ?? {
              label: log.action,
              icon: "•",
              color: "text-gray-600",
              bg: "bg-gray-100",
            };
            const isLast = index === logs.length - 1;
            const actor = log.user
              ? log.user.name
              : log.userId
              ? "User"
              : "System";

            return (
              <div key={log._id} className="flex gap-4 group">
                {/* Timeline spine */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${config.bg}`}
                  >
                    <span>{config.icon}</span>
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 bg-gray-100 my-1 min-h-[24px]" />
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 min-w-0 ${!isLast ? "pb-6" : "pb-2"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${config.color}`}>
                        {config.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        <span className="font-medium text-gray-600">{actor}</span>
                        {log.user?.email && (
                          <span className="ml-1 text-gray-400">· {log.user.email}</span>
                        )}
                      </p>
                    </div>
                    <time className="text-[11px] text-gray-400 shrink-0 tabular-nums mt-0.5">
                      {formatDateTime(log.timestamp)}
                    </time>
                  </div>

                  {/* Metadata pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      {log.ipAddress}
                    </span>

                    {typeof log.metadata?.fileName === "string" && (
                      <span className="inline-flex items-center text-[11px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full truncate max-w-[180px]">
                        {log.metadata.fileName}
                      </span>
                    )}

                    {typeof log.metadata?.rejectionReason === "string" && (
                      <span className="inline-flex items-center text-[11px] text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                        Reason: {log.metadata.rejectionReason}
                      </span>
                    )}

                    {typeof log.metadata?.fileType === "string" && (
                      <span className="inline-flex items-center text-[11px] text-purple-500 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
                        {log.metadata.fileType} PDF
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Legend ───────────────────────────────────────────────────────── */}
      {!isLoading && logs.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">
            Legend
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(ACTION_CONFIG) as Array<[AuditAction, { label: string; icon: string; color: string; bg: string }]>).map(
              ([key, cfg]) => (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color} border-transparent`}
                >
                  <span>{cfg.icon}</span>
                  {cfg.label}
                </span>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
