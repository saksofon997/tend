import { STATUS_LABELS, statusStyles } from "@/lib/design/status-labels";
import { cn } from "@/lib/utils";
import type { TendStatus } from "@tend/domain";

interface StatusBadgeProps {
  status: TendStatus;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
  const styles = statusStyles(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        styles.text,
        styles.bg,
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
