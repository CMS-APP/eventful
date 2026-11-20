import { Children, type ReactNode, createContext } from "react";

import { StyleSheet, View } from "react-native";

import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";

export const SwitchButtonDarkContext = createContext(false);

interface SwitchButtonGroupProps {
  children: ReactNode;
  dark?: boolean;
}

export function SwitchButtonGroup({
  children,
  dark = false
}: SwitchButtonGroupProps) {
  const rows = Children.toArray(children);

  return (
    <SwitchButtonDarkContext.Provider value={dark}>
      <View style={[styles.group, dark && styles.groupDark]}>
        {rows.map((row, index) => (
          <View
            key={index}
            style={
              index < rows.length - 1
                ? [styles.separator, dark && styles.separatorDark]
                : undefined
            }
          >
            {row}
          </View>
        ))}
      </View>
    </SwitchButtonDarkContext.Provider>
  );
}

const styles = StyleSheet.create({
  group: {
    ...card.medium,
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  groupDark: {
    backgroundColor: colors.primaryTint3,
    borderWidth: 0,
    shadowOpacity: 0
  },
  separator: {
    borderBottomColor: colors.lightGray,
    borderBottomWidth: 0.5
  },
  separatorDark: {
    borderBottomColor: colors.buttonBorder
  }
});
