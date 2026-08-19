import { cn } from "@/lib/utils";

interface HandsGivingIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/** Palms-up-together mark for tending — two cupped hands, not a to-do check. */
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
      <path d="M8.1 14.7c-1.7-.7-3.6-.1-4.2 1.5-.6 1.5.3 3.1 1.8 3.5" />
      <path d="M5.8 19.5c.8.6 1.9 1 3.2 1h3" />
      <path d="M7.1 15.3c-.5-2.5.2-4.8 2-6" />
      <path d="M9 14.8c-.2-2.9.7-5.3 2.4-6.5" />
      <path d="M10.9 14.6c0-2.9.9-5.4 2.4-6.6" />
      <path d="M15.9 14.7c1.7-.7 3.6-.1 4.2 1.5.6 1.5-.3 3.1-1.8 3.5" />
      <path d="M18.2 19.5c-.8.6-1.9 1-3.2 1h-3" />
      <path d="M16.9 15.3c.5-2.5-.2-4.8-2-6" />
      <path d="M15 14.8c.2-2.9-.7-5.3-2.4-6.5" />
      <path d="M13.1 14.6c0-2.9-.9-5.4-2.4-6.6" />
    </svg>
  );
}
