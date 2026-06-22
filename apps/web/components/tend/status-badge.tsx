"use client";

import { statusStyles } from "@/lib/design/status-labels";
import { useI18n } from "@/lib/i18n/client";
import { STATUS_TRANSLATION_KEYS } from "@/lib/i18n/labels";
import { cn } from "@/lib/utils";
import type { TendStatus } from "@tend/domain";

interface StatusBadgeProps {
  status: TendStatus;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
  const { t } = useI18n();
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
      {t(STATUS_TRANSLATION_KEYS[status])}
    </span>
  );
}
