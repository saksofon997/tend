import { colors } from "@/theme";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const GRASS_PATH =
  "M86 160c8-46 4-92-18-148M104 160c2-40 14-86 42-128M118 160c-6-38-22-78-12-132M312 160c10-42 2-96-22-142M328 160c4-48 18-90 48-126M538 160c-8-50 6-98 28-140M556 160c8-44-6-88-28-132M572 160c2-52 16-94 44-130M864 160c-10-46 4-94 26-138M882 160c6-40-8-86-24-128M1088 160c8-48-4-96-26-140M1106 160c4-42 16-88 40-124M1120 160c-6-38-18-82-8-126";

export function SceneBackground() {
  return (
    <View
      pointerEvents="none"
      style={styles.scene}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.sun} />
      <Svg style={styles.sunrays} viewBox="0 0 100 100" preserveAspectRatio="xMinYMin slice">
        <Path d="M0 0 L54 6 L48 12 Z" fill={colors.sun} opacity={0.18} />
        <Path d="M0 0 L64 18 L56 22 Z" fill={colors.sun} opacity={0.14} />
        <Path d="M0 0 L72 34 L62 36 Z" fill={colors.sun} opacity={0.11} />
        <Path d="M0 0 L58 48 L50 46 Z" fill={colors.sun} opacity={0.13} />
        <Path d="M0 0 L38 58 L34 50 Z" fill={colors.sun} opacity={0.1} />
        <Path d="M0 0 L22 62 L20 52 Z" fill={colors.sun} opacity={0.12} />
      </Svg>
      <Svg style={styles.grass} viewBox="0 0 1200 160" preserveAspectRatio="xMidYMax meet">
        <Path
          d={GRASS_PATH}
          fill="none"
          stroke={colors.grass}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          opacity={0.35}
        />
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
  sun: {
    backgroundColor: colors.sun,
    borderRadius: 280,
    height: 360,
    left: -90,
    opacity: 0.4,
    position: "absolute",
    top: -140,
    width: 420,
  },
  sunrays: {
    height: 280,
    left: 0,
    position: "absolute",
    top: 0,
    width: 320,
  },
  grass: {
    bottom: 0,
    height: 120,
    left: 0,
    position: "absolute",
    right: 0,
    width: "100%",
  },
});
