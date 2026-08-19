import Svg, { Path } from "react-native-svg";

interface HandsGivingIconProps {
  size?: number;
  color: string;
  strokeWidth?: number;
}

/** Palms-up-together mark for tending — two cupped hands, not a to-do check. */
export function HandsGivingIcon({ size = 16, color, strokeWidth = 1.5 }: HandsGivingIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Path
        d="M8.1 14.7c-1.7-.7-3.6-.1-4.2 1.5-.6 1.5.3 3.1 1.8 3.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.8 19.5c.8.6 1.9 1 3.2 1h3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.1 15.3c-.5-2.5.2-4.8 2-6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 14.8c-.2-2.9.7-5.3 2.4-6.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.9 14.6c0-2.9.9-5.4 2.4-6.6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.9 14.7c1.7-.7 3.6-.1 4.2 1.5.6 1.5-.3 3.1-1.8 3.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.2 19.5c-.8.6-1.9 1-3.2 1h-3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.9 15.3c.5-2.5-.2-4.8-2-6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 14.8c.2-2.9-.7-5.3-2.4-6.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.1 14.6c0-2.9-.9-5.4-2.4-6.6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
