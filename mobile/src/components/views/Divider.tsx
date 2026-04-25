import { StyleSheet, View } from "react-native";

import { colors } from "@/styles/colors";

type DividerProps = {
  color?: string;
  height?: number;
  marginHorizontal?: number;
};

export function Divider({
  color = colors.gray + "80",
  height = 1,
  marginHorizontal = 15
}: DividerProps) {
  return (
    <View
      style={[
        styles.divider,
        { backgroundColor: color, height, marginHorizontal }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1
  }
});
