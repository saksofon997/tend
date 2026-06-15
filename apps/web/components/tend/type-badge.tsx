import { TYPE_LABELS, typeStyles } from "@/lib/design/status-labels";
import { cn } from "@/lib/utils";
import type { TendItemType } from "@tend/domain";
import { CircleDot } from "lucide-react";

interface TypeBadgeProps {
  type: TendItemType;
  size?: "sm" | "md";
  className?: string;
}

export function TypeBadge({ type, size = "sm", className }: TypeBadgeProps) {
  const styles = typeStyles(type);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        styles.text,
        styles.bg,
        className,
      )}
    >
      {type === "must" ? <CircleDot className="h-3 w-3" aria-hidden /> : null}
      {TYPE_LABELS[type]}
    </span>
  );
}
