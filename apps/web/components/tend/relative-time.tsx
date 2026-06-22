import { formatRelativeFromDays, formatRelativeTended } from "@/lib/design/relative-time";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface RelativeTimeProps {
  date?: Date | string | null;
  daysSince?: number | null;
  prefix?: string;
  className?: string;
}

export function RelativeTime({ date, daysSince, prefix, className }: RelativeTimeProps) {
  const { locale } = useI18n();
  const text =
    date != null
      ? formatRelativeTended(typeof date === "string" ? new Date(date) : date, new Date(), {
          locale,
          prefix,
        })
      : formatRelativeFromDays(daysSince ?? null, { locale, prefix });

  return <span className={cn("text-sm text-muted-foreground", className)}>{text}</span>;
}
