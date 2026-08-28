import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

interface BadgeProps {
  count: number;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ count, style }: BadgeProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <View style={[styles.badge, style]}>
      <Text type="subHeader" style={styles.badgeText} center>
        {count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 6,
    position: "absolute"
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    left: 0.5
  }
});
