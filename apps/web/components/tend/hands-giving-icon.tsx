import { cn } from "@/lib/utils";

interface HandsGivingIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/** Palms-up-together mark for tending — care offered, not a to-do check. */
export function HandsGivingIcon({ className, size = 16, strokeWidth = 1.5 }: HandsGivingIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      aria-hidden
      data-icon="hands-giving"
    >
      <title>Hands giving</title>
      <path d="M12 13.2c-1.5-1.2-4.2-1.5-6 .4-1.4 1.4-1.6 3.6-.4 5.2 1.1 1.5 3.1 2.2 5 1.8.9-.2 1.6-.7 2.2-1.4" />
      <path d="M7.4 11.2c-.3-1.6.7-3.1 2.3-3.5 1.3-.3 2.6.4 3.1 1.7" />
      <path d="M9.8 8.4c-.2-1.3.7-2.5 2-2.8" />
      <path d="M12 13.2c1.5-1.2 4.2-1.5 6 .4 1.4 1.4 1.6 3.6.4 5.2-1.1 1.5-3.1 2.2-5 1.8-.9-.2-1.6-.7-2.2-1.4" />
      <path d="M16.6 11.2c.3-1.6-.7-3.1-2.3-3.5-1.3-.3-2.6.4-3.1 1.7" />
      <path d="M14.2 8.4c.2-1.3-.7-2.5-2-2.8" />
    </svg>
  );
}
