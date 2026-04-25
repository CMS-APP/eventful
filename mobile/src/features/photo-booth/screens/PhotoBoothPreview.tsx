import { StyleSheet, View } from "react-native";

import { Screen } from "@/components/views/screen/Screen";
import { colors } from "@/styles/colors";

import { PhotoBoothColumnCollage } from "../components/result/PhotoBoothColumnCollage";
import { PhotoBoothGridCollage } from "../components/result/PhotoBoothGridCollage";
import { PhotoBoothRowCollage } from "../components/result/PhotoBoothRowCollage";
import { usePhotoBoothSettings } from "../provider/PhotoBoothSettingsProvider";

export function PhotoBoothPreview() {
  const { filter, collageStyle } = usePhotoBoothSettings();

  return (
    <Screen
      contentConfig={{ tabBarPresent: false }}
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Photo Booth",
          subTitle: "Preview",
          icon: "eye",
          color: colors.white,
          accountButton: false,
          backgroundColor: colors.primary,
          backAction: true
        }
      }}
    >
      <View style={styles.container}>
        <View style={styles.finalImageContainer}>
          {collageStyle === "row" ? (
            <PhotoBoothRowCollage filter={filter} preview />
          ) : collageStyle === "column" ? (
            <PhotoBoothColumnCollage filter={filter} preview />
          ) : collageStyle === "square" ? (
            <PhotoBoothGridCollage filter={filter} preview />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginTop: 52,
    paddingHorizontal: 24
  },
  finalImageContainer: {
    padding: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6
  }
});
