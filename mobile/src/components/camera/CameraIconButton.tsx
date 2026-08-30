import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { shadows } from "@/design-system/tokens/shadows";

interface CameraIconButtonProps {
  onPress: () => void;
  icon: keyof typeof FontAwesome5.glyphMap;
  color?: string;
  iconColor?: string;
  disabled?: boolean;
}

export function CameraIconButton({
  onPress,
  icon,
  color,
  iconColor = colors.white,
  disabled = false
}: CameraIconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={getHitSlop("small")}
      disabled={disabled}
    >
      <View
        style={[
          styles.button,
          color ? { backgroundColor: color } : null,
          disabled && styles.disabled
        ]}
      >
        <FontAwesome5 name={icon} size={20} color={iconColor} />
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
    ...shadows.buttonShadow
  },
  disabled: {
    opacity: 0.5
  }
});
