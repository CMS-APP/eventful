import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { shadows } from "@/design-system/tokens/shadows";

interface CameraActionButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function CameraActionButton({
  label,
  onPress,
  disabled = false
}: CameraActionButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      hitSlop={getHitSlop("small")}
    >
      <View style={[styles.button, disabled && styles.disabled]}>
        <Text type="subHeader" color={colors.white}>
          {label}
        </Text>
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
    justifyContent: "center",
    minHeight: 50,
    padding: 12,
    ...shadows.buttonShadow
  },
  disabled: {
    opacity: 0.5
  }
});
