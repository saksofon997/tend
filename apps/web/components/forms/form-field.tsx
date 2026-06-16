import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  required?: boolean;
  counter?: { length: number; max: number };
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  helper,
  error,
  required,
  counter,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-muted-foreground"> *</span> : null}
      </Label>
      {helper ? <p className="text-sm text-muted-foreground">{helper}</p> : null}
      {children}
      {counter || error ? (
        <div
          className={cn(
            "flex min-h-5 items-start gap-2",
            error ? "justify-between" : "justify-end",
          )}
        >
          {error ? (
            <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {counter ? (
            <p
              id={`${id}-counter`}
              className={cn(
                "shrink-0 text-xs tabular-nums text-muted-foreground",
                counter.length >= counter.max && "text-destructive",
              )}
            >
              {counter.length}/{counter.max}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
