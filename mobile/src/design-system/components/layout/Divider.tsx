import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";

interface DividerProps {
  dark?: boolean;
  color?: string;
}

export function Divider({ dark = false, color = colors.gray }: DividerProps) {
  return (
    <View
      style={[
        styles.divider,
        dark && styles.dividerDark,
        { backgroundColor: color }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1
  },
  dividerDark: {
    backgroundColor: colors.white
  }
});
