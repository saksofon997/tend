import { colors } from "@/theme";
import { SCENE_GRASS_BLADES, SCENE_SUN, SCENE_SUN_RAYS, SCENE_VIEWBOX } from "@tend/domain";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, G, Path, RadialGradient, Rect, Stop } from "react-native-svg";

const SUN_GLOW_ID = "tend-scene-sun-glow";

export function SceneBackground() {
  return (
    <View
      pointerEvents="none"
      style={styles.scene}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg style={styles.art} viewBox={SCENE_VIEWBOX} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient
            id={SUN_GLOW_ID}
            cx={SCENE_SUN.originX}
            cy={SCENE_SUN.originY + 40}
            r={SCENE_SUN.glowRadius}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor={colors.sun} stopOpacity="1" />
            <Stop offset="42%" stopColor={colors.sunSoft} stopOpacity="0.85" />
            <Stop offset="100%" stopColor={colors.sunSoft} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="1200" height="800" fill={`url(#${SUN_GLOW_ID})`} />
        <Circle
          cx={SCENE_SUN.originX + 18}
          cy={SCENE_SUN.originY + 48}
          r={SCENE_SUN.coreRadius}
          fill={colors.sun}
          opacity={0.35}
        />
        <G fill={colors.sunRay}>
          {SCENE_SUN_RAYS.map((ray) => (
            <Path key={ray.d} d={ray.d} opacity={ray.opacity} />
          ))}
        </G>
        <G fill="none" stroke={colors.grass} strokeLinecap="round" strokeLinejoin="round">
          {SCENE_GRASS_BLADES.map((blade) => (
            <Path
              key={blade.d}
              d={blade.d}
              strokeWidth={blade.strokeWidth}
              opacity={blade.opacity}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: 0,
  },
  art: {
    ...StyleSheet.absoluteFillObject,
  },
});
