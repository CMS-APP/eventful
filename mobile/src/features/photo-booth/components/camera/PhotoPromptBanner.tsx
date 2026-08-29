import { StyleSheet, View } from "react-native";

import { useAppDimensions } from "@/app/hooks/useAppDimensions";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

import { TIMER_RING_SIZE } from "./PhotoBoothTimer";

const RING_GAP = 20;

type PhotoPromptBannerProps = {
  prompt: string;
};

export function PhotoPromptBanner({ prompt }: PhotoPromptBannerProps) {
  const { screenHeight } = useAppDimensions();

  const ringTop = screenHeight * 0.5 - TIMER_RING_SIZE / 2;
  const bottom = screenHeight - ringTop + RING_GAP;

  return (
    <View pointerEvents="none" style={[styles.container, { bottom }]}>
      <Text type="subHeader" color={colors.white} style={styles.text}>
        {prompt}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    left: 24,
    position: "absolute",
    right: 24
  },
  text: {
    backgroundColor: colors.blackTransparent,
    borderRadius: 12,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 8,
    textAlign: "center"
  }
});
