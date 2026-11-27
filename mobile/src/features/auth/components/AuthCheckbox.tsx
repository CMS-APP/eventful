import type { ReactNode } from "react";

import { Pressable, StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { colors } from "@/design-system/tokens/colors";
import { haptics } from "@/utils/haptics";

interface AuthCheckboxProps {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}

export function AuthCheckbox({
  checked,
  onChange,
  children
}: AuthCheckboxProps) {
  function handlePress() {
    haptics.soft();
    onChange();
  }

  return (
    <Pressable
      onPress={handlePress}
      style={styles.container}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && (
          <FontAwesome5 name="check" size={13} color={colors.white} />
        )}
      </View>
      <View style={styles.label}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    borderColor: colors.gray,
    borderRadius: 6,
    borderWidth: 2,
    height: 24,
    justifyContent: "center",
    width: 24
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingVertical: 4
  },
  label: {
    flex: 1
  }
});
