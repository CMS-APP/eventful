import { Children, type ReactNode } from "react";

import { StyleSheet, View } from "react-native";

import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";

export function SwitchButtonGroup({ children }: { children: ReactNode }) {
  const rows = Children.toArray(children);

  return (
    <View style={styles.group}>
      {rows.map((row, index) => (
        <View
          key={index}
          style={index < rows.length - 1 ? styles.separator : undefined}
        >
          {row}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    ...card.medium,
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  separator: {
    borderBottomColor: colors.lightGray,
    borderBottomWidth: 0.5
  }
});
