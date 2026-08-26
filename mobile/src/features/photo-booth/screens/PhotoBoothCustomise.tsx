import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/views/screen/Screen";
import { Button } from "@/design-system/components/Button";
import { colors } from "@/design-system/tokens/colors";

import type { PhotoBoothStackNavigation } from "../photoBoothStackParams";

export function PhotoBoothCustomise() {
  const navigation = useNavigation<PhotoBoothStackNavigation>();

  return (
    <Screen
      contentConfig={{ tabBarPresent: false }}
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Photo Booth",
          subTitle: "Customise",
          icon: "cog",
          color: colors.white,
          accountButton: false,
          backgroundColor: colors.primary,
          backAction: true
        }
      }}
    >
      <View style={styles.container}>
        <Button
          text="Layout & Filters"
          icon="images"
          onPress={() => {
            navigation.navigate("PhotoBoothLayout");
          }}
          color={colors.primary}
          textColor={colors.white}
        />

        <Button
          text="Text & Colors"
          icon="font"
          onPress={() => {
            navigation.navigate("PhotoBoothTextColors");
          }}
          color={colors.primary}
          textColor={colors.white}
        />
        <Button
          text="Settings"
          icon="cog"
          onPress={() => {
            navigation.navigate("PhotoBoothSettings");
          }}
          color={colors.primary}
          textColor={colors.white}
        />
        <Button
          text="Preview"
          icon="eye"
          onPress={() => {
            navigation.navigate("PhotoBoothPreview");
          }}
          color={colors.primary}
          textColor={colors.white}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginTop: 52,
    paddingHorizontal: 24
  }
});
