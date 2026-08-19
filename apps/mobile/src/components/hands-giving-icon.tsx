import Svg, { Path } from "react-native-svg";

interface HandsGivingIconProps {
  size?: number;
  color: string;
  strokeWidth?: number;
}

/** Palms-up-together mark for tending — care offered, not a to-do check. */
export function HandsGivingIcon({ size = 16, color, strokeWidth = 1.5 }: HandsGivingIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Path
        d="M12 13.2c-1.5-1.2-4.2-1.5-6 .4-1.4 1.4-1.6 3.6-.4 5.2 1.1 1.5 3.1 2.2 5 1.8.9-.2 1.6-.7 2.2-1.4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.4 11.2c-.3-1.6.7-3.1 2.3-3.5 1.3-.3 2.6.4 3.1 1.7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.8 8.4c-.2-1.3.7-2.5 2-2.8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 13.2c1.5-1.2 4.2-1.5 6 .4 1.4 1.4 1.6 3.6.4 5.2-1.1 1.5-3.1 2.2-5 1.8-.9-.2-1.6-.7-2.2-1.4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.6 11.2c.3-1.6-.7-3.1-2.3-3.5-1.3-.3-2.6.4-3.1 1.7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.2 8.4c.2-1.3-.7-2.5-2-2.8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
