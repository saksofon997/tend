"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MarkTendedButtonProps {
  itemId: string;
  onTend: (id: string) => Promise<void>;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export const MARK_TENDED_CONFIRMATION_MS = 900;

export function markTendedButtonLabel({
  loading,
  confirmed,
}: {
  loading: boolean;
  confirmed: boolean;
}) {
  if (loading) {
    return "Updating…";
  }

  return confirmed ? "Tended" : "Mark tended";
}

export function MarkTendedButton({
  itemId,
  onTend,
  size = "default",
  className,
}: MarkTendedButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const confirmationTimeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (confirmationTimeout.current !== null) {
        window.clearTimeout(confirmationTimeout.current);
      }
    };
  }, []);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setLoading(true);
    setConfirmed(false);
    try {
      await onTend(itemId);
      setConfirmed(true);
      confirmationTimeout.current = window.setTimeout(() => {
        setConfirmed(false);
        confirmationTimeout.current = null;
      }, MARK_TENDED_CONFIRMATION_MS);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      size={size}
      className={cn(
        "group transition-[background-color,color,transform] hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-colors",
        confirmed && "bg-[var(--tend-success)] hover:bg-[var(--tend-success)]",
        className,
      )}
      onClick={handleClick}
      disabled={loading}
      aria-live="polite"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Check
          className={cn(
            "h-4 w-4 transition-transform duration-[var(--tend-duration-fast)] ease-[var(--tend-ease)] group-hover:scale-110 group-active:scale-95 motion-reduce:transition-none",
            confirmed && "scale-110",
          )}
          aria-hidden
        />
      )}
      {markTendedButtonLabel({ loading, confirmed })}
    </Button>
  );
}
