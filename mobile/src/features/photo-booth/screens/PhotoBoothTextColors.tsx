import { StyleSheet, View } from "react-native";

import { Screen } from "@/components/screen/Screen";
import { Divider } from "@/design-system/components/layout/Divider";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

import { ColorButton } from "../components/customise/ColorButton";
import { CustomiseText } from "../components/customise/CustomiseText";

export function PhotoBoothTextColors() {
  const { frameColor, textColor } = usePhotoBoothSettings();

  return (
    <Screen
      contentConfig={{ tabBarPresent: true }}
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Photo Booth",
          subTitle: "Text & Colors",
          icon: "font",
          color: colors.white,
          accountButton: false,
          backgroundColor: colors.primary,
          backAction: true
        }
      }}
    >
      <View style={styles.container}>
        <Text type="header">Text</Text>
        <CustomiseText />
        <Divider />

        <Text type="header">Colors</Text>
        <View style={styles.colorsRow}>
          <ColorButton color={frameColor} type="frame" />
          <ColorButton color={textColor} type="text" />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  colorsRow: {
    flexDirection: "row",
    gap: 12
  },
  container: {
    gap: 16,
    marginTop: 52,
    paddingHorizontal: 24
  }
});
