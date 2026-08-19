import { cn } from "@/lib/utils";
import { HANDS_GIVING_ICON_PATHS, HANDS_GIVING_ICON_VIEWBOX } from "@tend/domain";

interface HandsGivingIconProps {
  className?: string;
  size?: number;
}

/** Palms-up-together mark for tending — converted filled glyph, not a to-do check. */
export function HandsGivingIcon({ className, size = 16 }: HandsGivingIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={HANDS_GIVING_ICON_VIEWBOX}
      fill="currentColor"
      className={cn(className)}
      aria-hidden
      data-icon="hands-giving"
    >
      <title>Hands giving</title>
      {HANDS_GIVING_ICON_PATHS.map((path) => (
        <path key={path.transform} d={path.d} transform={path.transform} />
      ))}
    </svg>
  );
}
