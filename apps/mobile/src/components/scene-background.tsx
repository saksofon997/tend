import { Image, StyleSheet, View } from "react-native";

const scenePortrait = require("../../assets/scene/tend-scene-portrait.webp");

/**
 * Portrait meadow file stays in assets/scene. Rendering is off so the
 * parchment background can stand on its own until new artwork arrives.
 */
export const SCENE_ART_ENABLED = false;

export function SceneBackground() {
  return (
    <View
      pointerEvents="none"
      style={styles.scene}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {SCENE_ART_ENABLED ? (
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="cover"
          source={scenePortrait}
          style={styles.art}
        />
      ) : null}
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
    height: "100%",
    width: "100%",
  },
});
