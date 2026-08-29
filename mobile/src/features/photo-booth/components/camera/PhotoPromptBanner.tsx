import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

type PhotoPromptBannerProps = {
  prompt: string;
};

export function PhotoPromptBanner({ prompt }: PhotoPromptBannerProps) {
  return (
    <View pointerEvents="none" style={styles.container}>
      <Text type="subHeader" color={colors.white} style={styles.text}>
        {prompt}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: 20,
    paddingHorizontal: 24
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
