import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

export function AuthDivider({ label }: { label: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text type="caption" color={colors.gray}>
        {label}
      </Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  line: {
    backgroundColor: colors.lightGray,
    flex: 1,
    height: 1
  }
});
