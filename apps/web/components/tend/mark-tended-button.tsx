"use client";

import { HandsGivingIcon } from "@/components/tend/hands-giving-icon";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
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
  idleLabel = "Mark tended",
  loadingLabel = "Updating…",
  confirmedLabel = "Tended",
}: {
  loading: boolean;
  confirmed: boolean;
  idleLabel?: string;
  loadingLabel?: string;
  confirmedLabel?: string;
}) {
  if (loading) {
    return loadingLabel;
  }

  return confirmed ? confirmedLabel : idleLabel;
}

export function MarkTendedButton({
  itemId,
  onTend,
  size = "default",
  className,
}: MarkTendedButtonProps) {
  const { t } = useI18n();
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
        <HandsGivingIcon
          className={cn(
            "transition-transform duration-[var(--tend-duration-fast)] ease-[var(--tend-ease)] group-hover:scale-110 group-active:scale-95 motion-reduce:transition-none",
            confirmed && "scale-110",
          )}
          size={16}
        />
      )}
      {markTendedButtonLabel({
        loading,
        confirmed,
        idleLabel: t("items.markTended"),
        loadingLabel: t("items.markTendedUpdating"),
        confirmedLabel: t("items.markTendedConfirmed"),
      })}
    </Button>
  );
}
