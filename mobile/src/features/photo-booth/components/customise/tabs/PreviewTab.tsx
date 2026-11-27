import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

import { PhotoBoothCollage } from "../../result/PhotoBoothCollage";
import { ScaledCollage } from "../../result/ScaledCollage";

const PREVIEW_PADDING = 16;

export function PreviewTab() {
  const { filter } = usePhotoBoothSettings();

  return (
    <View style={styles.container}>
      <View style={styles.previewBackground}>
        <ScaledCollage horizontalPadding={48 + PREVIEW_PADDING * 2}>
          <PhotoBoothCollage filter={filter} preview />
        </ScaledCollage>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginTop: 24,
    paddingHorizontal: 24
  },
  previewBackground: {
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 24,
    justifyContent: "center",
    padding: PREVIEW_PADDING
  }
});
