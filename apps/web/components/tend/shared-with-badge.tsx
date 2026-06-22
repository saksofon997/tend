"use client";

import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface SharedWithBadgeProps {
  displayName: string;
  size?: "sm" | "md";
  className?: string;
}

export function SharedWithBadge({ displayName, size = "sm", className }: SharedWithBadgeProps) {
  const { t } = useI18n();

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-sm border border-[var(--tend-shared-border)] bg-[var(--tend-shared-bg)] font-medium text-[var(--tend-shared)]",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        className,
      )}
    >
      <Users className="h-3 w-3 shrink-0" aria-hidden />
      <span className="truncate">{t("items.sharedWith", { name: displayName })}</span>
    </span>
  );
}
