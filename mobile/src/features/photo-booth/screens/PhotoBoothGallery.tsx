import { StyleSheet, View } from "react-native";

import { Screen } from "@/components/views/screen/Screen";
import { colors } from "@/design-system/tokens/colors";

import { GalleryEventList } from "../components/gallery/GalleryEventList";

export function PhotoBoothGallery() {
  return (
    <Screen
      contentConfig={{ tabBarPresent: false }}
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Photo Booth",
          subTitle: "Gallery",
          icon: "cloud",
          color: colors.white,
          accountButton: false,
          backgroundColor: colors.primary,
          backAction: true
        }
      }}
    >
      <View style={styles.container}>
        <GalleryEventList />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 52
  }
});
