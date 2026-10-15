import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex items-start justify-between gap-x-3 gap-y-2", className)}>
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-[length:var(--tend-text-2xl)] font-medium leading-tight text-pretty break-words text-balance text-foreground sm:text-[length:var(--tend-text-3xl)]">
          {title}
        </h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
