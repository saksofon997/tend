import { Image, StyleSheet, View } from "react-native";

const scenePortrait = require("../../assets/scene/tend-scene-portrait.webp");

export function SceneBackground() {
  return (
    <View
      pointerEvents="none"
      style={styles.scene}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={scenePortrait}
        style={styles.art}
      />
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
