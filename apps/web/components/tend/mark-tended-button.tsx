"use client";

import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

interface MarkTendedButtonProps {
  itemId: string;
  onTend: (id: string) => Promise<void>;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function MarkTendedButton({
  itemId,
  onTend,
  size = "default",
  className,
}: MarkTendedButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setLoading(true);
    try {
      await onTend(itemId);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      size={size}
      className={className}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Check className="h-4 w-4" aria-hidden />
      )}
      {loading ? "Updating…" : "Mark tended"}
    </Button>
  );
}
