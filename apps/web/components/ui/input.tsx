import { cn } from "@/lib/utils";
import * as React from "react";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground transition-colors duration-[var(--tend-duration-fast)] placeholder:text-[var(--tend-text-subtle)] focus-visible:border-[var(--tend-border-focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tend-primary-muted)] focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
