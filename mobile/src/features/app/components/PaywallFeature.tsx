import { StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { globalStyles } from "@/design-system/tokens/globalStyles";

interface PaywallFeatureProps {
  icon: keyof typeof FontAwesome5.glyphMap;
  description: string;
}

export function PaywallFeature({ icon, description }: PaywallFeatureProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, {}]}>
        <FontAwesome5 name={icon} size={24} color={colors.white} />
      </View>
      <View
        style={[styles.textContainer, { backgroundColor: colors.lightGray }]}
      >
        <Text type="body" color={colors.black} style={styles.descriptionText}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: 12
  },
  descriptionText: {
    flex: 1,
    textAlign: "left"
  },
  iconContainer: {
    ...globalStyles.smallWidget,
    alignItems: "center",
    backgroundColor: colors.primaryTint,
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    padding: 12,
    width: 52
  },
  textContainer: {
    alignItems: "flex-start",
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    padding: 12
  }
});
