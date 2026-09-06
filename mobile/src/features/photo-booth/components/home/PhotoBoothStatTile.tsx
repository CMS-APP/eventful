import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";

interface PhotoBoothStatTileProps {
  value: number | string;
  label: string;
}

export function PhotoBoothStatTile({ value, label }: PhotoBoothStatTileProps) {
  return (
    <View style={styles.container}>
      <Text type="title" color={colors.primary} style={styles.value}>
        {value}
      </Text>
      <Text type="caption" color={colors.gray}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...card.small,
    alignItems: "center",
    borderRadius: 20,
    flex: 1,
    gap: 4,
    paddingVertical: 16
  },
  value: {
    lineHeight: 40
  }
});
