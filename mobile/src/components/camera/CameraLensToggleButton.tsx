import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { shadows } from "@/design-system/tokens/shadows";

interface CameraLensToggleButtonProps {
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function CameraLensToggleButton({
  active,
  onPress,
  disabled = false
}: CameraLensToggleButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={getHitSlop("small")}
      disabled={disabled}
    >
      <View style={[styles.button, disabled && styles.disabled]}>
        <Text style={styles.label}>{active ? "0.5x" : "1x"}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.black,
    borderColor: colors.buttonBorder,
    borderRadius: 12,
    borderWidth: 0.5,
    height: 50,
    justifyContent: "center",
    padding: 12,
    width: 60,
    ...shadows.mediumShadow
  },
  disabled: {
    opacity: 0.5
  },
  label: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600"
  }
});
