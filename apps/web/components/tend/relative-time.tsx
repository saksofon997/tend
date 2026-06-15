import { formatRelativeFromDays, formatRelativeTended } from "@/lib/design/relative-time";
import { cn } from "@/lib/utils";

interface RelativeTimeProps {
  date?: Date | string | null;
  daysSince?: number | null;
  prefix?: string;
  className?: string;
}

export function RelativeTime({ date, daysSince, prefix, className }: RelativeTimeProps) {
  const text =
    daysSince !== undefined
      ? formatRelativeFromDays(daysSince)
      : formatRelativeTended(date ? new Date(date) : null);

  const display = prefix ? text.replace("Last tended", prefix) : text;

  return <span className={cn("text-sm text-muted-foreground", className)}>{display}</span>;
}
