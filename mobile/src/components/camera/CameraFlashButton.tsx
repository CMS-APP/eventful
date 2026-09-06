import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { shadows } from "@/design-system/tokens/shadows";

interface CameraFlashButtonProps {
  enabled: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function CameraFlashButton({
  enabled,
  onPress,
  disabled = false
}: CameraFlashButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={getHitSlop("small")}
      disabled={disabled}
    >
      <View style={[styles.button, disabled && styles.disabled]}>
        <View style={styles.iconWrap}>
          <FontAwesome5 name="bolt" size={20} color={colors.white} />
          {!enabled ? <View style={styles.slash} /> : null}
        </View>
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
  iconWrap: {
    alignItems: "center",
    height: 20,
    justifyContent: "center",
    width: 20
  },
  slash: {
    backgroundColor: colors.white,
    height: 26,
    position: "absolute",
    transform: [{ rotate: "-45deg" }],
    width: 2
  }
});
