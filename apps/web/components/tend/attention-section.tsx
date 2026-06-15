"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface AttentionSectionProps {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
  emptyMessage?: string;
}

export function AttentionSection({
  title,
  count,
  defaultOpen = true,
  children,
  emptyMessage,
}: AttentionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="mb-8">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="mb-3 flex w-full items-center gap-2 text-left"
        aria-expanded={open}
      >
        <h2 className="font-display text-xl font-medium text-foreground">{title}</h2>
        <span className="rounded-full bg-[var(--tend-bg-muted)] px-2 py-0.5 text-xs text-muted-foreground">
          {count}
        </span>
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 text-muted-foreground transition-transform duration-[var(--tend-duration-fast)] motion-reduce:transition-none",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        count > 0 ? (
          <div className="flex flex-col gap-2">{children}</div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {emptyMessage ?? "Nothing here right now."}
          </p>
        )
      ) : null}
    </section>
  );
}
