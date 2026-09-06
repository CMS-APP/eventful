import React from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";

export function CustomiseCollageItem({
  children,
  isSelected,
  onPress
}: {
  children: React.ReactNode;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={onPress}
      hitSlop={getHitSlop("medium")}
    >
      {children}
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <FontAwesome5 name="check" size={16} color={colors.white} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...card.small,
    borderColor: colors.lightGray,
    borderRadius: 6,
    borderWidth: 2,
    gap: 2,
    justifyContent: "center",
    padding: 2
  },
  selectedContainer: {
    borderColor: colors.secondary
  },
  selectedIndicator: {
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 6,
    height: 20,
    justifyContent: "center",
    position: "absolute",
    right: -10,
    top: -10,
    width: 20
  }
});
