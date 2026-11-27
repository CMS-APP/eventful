import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";

import { AnimatedPreviewCollage } from "./AnimatedPreviewCollage";

const PREVIEW_HEIGHT = 280;
const PREVIEW_PADDING = 16;

export function LivePreview() {
  return (
    <View style={styles.container}>
      <AnimatedPreviewCollage
        horizontalPadding={48 + PREVIEW_PADDING * 2}
        maxHeight={PREVIEW_HEIGHT - PREVIEW_PADDING * 2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 24,
    height: PREVIEW_HEIGHT,
    justifyContent: "center",
    padding: PREVIEW_PADDING
  }
});
