import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { shadows } from "@/design-system/tokens/shadows";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

import { CollageDiagram, type CollageOption } from "./CollageDiagram";

const COLLAGE_OPTIONS: CollageOption[] = [
  { style: "single", label: "Single", columns: 1, rows: 1 },
  { style: "column", label: "Strip of 3", columns: 1, rows: 3 },
  { style: "row", label: "Row of 3", columns: 3, rows: 1 },
  { style: "square", label: "Grid", columns: 2, rows: 2 }
];

export function CustomiseCollage() {
  const { collageStyle, setCollageStyle } = usePhotoBoothSettings();

  return (
    <View style={styles.container}>
      {COLLAGE_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.style}
          style={[
            styles.item,
            collageStyle === option.style && styles.selectedItem
          ]}
          onPress={() => setCollageStyle(option.style)}
          hitSlop={getHitSlop("medium")}
        >
          <CollageDiagram {...option} />
          <Text type="body" color={colors.black} style={styles.label}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10
  },
  item: {
    ...shadows.lightShadow,
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.lightGray,
    borderRadius: 16,
    borderWidth: 0.5,
    flex: 1,
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 10
  },
  label: {
    fontSize: 9,
    letterSpacing: 1,
    textAlign: "center",
    textTransform: "uppercase"
  },
  selectedItem: {
    borderColor: colors.secondary,
    borderWidth: 3
  }
});
