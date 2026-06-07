import { DocumentStatus } from "@/types";

interface StatusBadgeProps {
  status: DocumentStatus;
}

const config: Record<
  DocumentStatus,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: "Pending",
    className: "badge-pending",
    dot: "bg-amber-400",
  },
  signed: {
    label: "Signed",
    className: "badge-signed",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    className: "badge-rejected",
    dot: "bg-red-500",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className, dot } = config[status];
  return (
    <span className={className}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} mr-1.5`} />
      {label}
    </span>
  );
}
