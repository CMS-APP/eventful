import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";

import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";
import { CustomiseCollageItem } from "./CustomiseCollageItem";

export function CustomiseCollage() {
  const { collageStyle, setCollageStyle } = usePhotoBoothSettings();

  function CollageBox() {
    return <View style={styles.collageBox} />;
  }

  return (
    <View style={styles.container}>
      <Text type="subHeader">Photo Templates</Text>

      <View style={styles.collageContainer}>
        <CustomiseCollageItem
          isSelected={collageStyle === "square"}
          onPress={() => setCollageStyle("square")}
        >
          <View style={styles.collageRow}>
            <CollageBox />
            <CollageBox />
          </View>
          <View style={styles.collageRow}>
            <CollageBox />
            <CollageBox />
          </View>
        </CustomiseCollageItem>

        <CustomiseCollageItem
          isSelected={collageStyle === "row"}
          onPress={() => setCollageStyle("row")}
        >
          <View style={styles.collageRow}>
            <CollageBox />
            <CollageBox />
            <CollageBox />
          </View>
        </CustomiseCollageItem>

        <CustomiseCollageItem
          isSelected={collageStyle === "column"}
          onPress={() => setCollageStyle("column")}
        >
          <CollageBox />
          <CollageBox />
          <CollageBox />
        </CustomiseCollageItem>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collageBox: {
    backgroundColor: colors.black,
    height: 30,
    width: 30
  },
  collageContainer: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  collageRow: {
    flexDirection: "row",
    gap: 2
  },
  container: {
    gap: 12
  }
});
