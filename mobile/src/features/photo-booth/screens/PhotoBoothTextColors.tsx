import { StyleSheet, View } from "react-native";

import { Text } from "@/components/text/Text";
import { Divider } from "@/components/views/Divider";
import { Screen } from "@/components/views/screen/Screen";
import { colors } from "@/styles/colors";

import { ColorButton } from "../components/customise/ColorButton";
import { CustomiseText } from "../components/customise/CustomiseText";
import { usePhotoBoothSettings } from "../provider/PhotoBoothSettingsProvider";

export function PhotoBoothTextColors() {
  const { frameColor, textColor } = usePhotoBoothSettings();

  return (
    <Screen
      contentConfig={{ tabBarPresent: false }}
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
