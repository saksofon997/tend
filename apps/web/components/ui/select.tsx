import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import * as React from "react";

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, disabled, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border border-input bg-card py-2 pl-3 pr-9 text-base text-foreground transition-colors duration-[var(--tend-duration-fast)] focus-visible:border-[var(--tend-border-focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
            disabled && "opacity-50",
          )}
          aria-hidden
        />
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
