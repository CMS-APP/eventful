import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";

interface DividerProps {
  dark?: boolean;
}

export function Divider({ dark = false }: DividerProps) {
  return <View style={[styles.divider, dark && styles.dividerDark]} />;
}

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.gray,
    height: 1
  },
  dividerDark: {
    backgroundColor: colors.white
  }
});
