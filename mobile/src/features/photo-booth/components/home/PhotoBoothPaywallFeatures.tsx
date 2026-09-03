import { StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

interface PhotoBoothPaywallFeature {
  icon: keyof typeof FontAwesome5.glyphMap;
  label: string;
}

const FEATURES: PhotoBoothPaywallFeature[] = [
  { icon: "camera", label: "Unlimited Photos" },
  { icon: "cloud", label: "Shared Photo Gallery" },
  { icon: "images", label: "Layouts & Filters" },
  { icon: "lock", label: "Locking Mode" }
];

export function PhotoBoothPaywallFeatures() {
  return (
    <View style={styles.container}>
      {FEATURES.map((feature, index) => (
        <View
          key={feature.label}
          style={[styles.row, index > 0 && styles.rowDivider]}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5 name={feature.icon} size={18} color={colors.white} />
          </View>
          <Text type="subHeader" color={colors.black}>
            {feature.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    width: "100%"
  },
  iconContainer: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    paddingVertical: 14
  },
  rowDivider: {
    borderTopColor: colors.lightGray,
    borderTopWidth: 1
  }
});
