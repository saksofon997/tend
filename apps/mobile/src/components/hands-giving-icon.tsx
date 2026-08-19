import { HANDS_GIVING_ICON_PATHS, HANDS_GIVING_ICON_VIEWBOX } from "@tend/domain";
import Svg, { Path } from "react-native-svg";

interface HandsGivingIconProps {
  size?: number;
  color: string;
}

/** Palms-up-together mark for tending — converted filled glyph, not a to-do check. */
export function HandsGivingIcon({ size = 16, color }: HandsGivingIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={HANDS_GIVING_ICON_VIEWBOX}
      fill="none"
      accessibilityElementsHidden
    >
      {HANDS_GIVING_ICON_PATHS.map((path) => (
        <Path key={path.transform} d={path.d} fill={color} transform={path.transform} />
      ))}
    </Svg>
  );
}
