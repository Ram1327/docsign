import { format, formatDistanceToNow } from "date-fns";
import { DocumentStatus, AuditAction } from "@/types";

export function formatDate(dateString: string): string {
  return format(new Date(dateString), "MMM d, yyyy");
}

export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), "MMM d, yyyy · h:mm a");
}

export function formatRelative(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getStatusLabel(status: DocumentStatus): string {
  const labels: Record<DocumentStatus, string> = {
    pending: "Pending",
    signed: "Signed",
    rejected: "Rejected",
  };
  return labels[status];
}

export function getAuditActionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    upload: "Uploaded document",
    view: "Viewed document",
    sign: "Signed document",
    reject: "Rejected document",
    download: "Downloaded document",
    link_generated: "Generated signing link",
    link_opened: "Opened signing link",
    delete: "Deleted document",
  };
  return labels[action];
}
