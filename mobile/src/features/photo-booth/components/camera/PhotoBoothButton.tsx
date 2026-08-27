import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { shadows } from "@/design-system/tokens/shadows";

interface PhotoBoothButtonProps {
  onPress: () => void;
  icon: keyof typeof FontAwesome5.glyphMap;
  color: string;
  textColor: string;
  disabled?: boolean;
}

export function PhotoBoothButton({
  onPress,
  icon,
  color,
  textColor,
  disabled = false
}: PhotoBoothButtonProps) {
  const buttonStyle = [
    styles.buttonContainer,
    { backgroundColor: color, opacity: disabled ? 0.5 : 1 }
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={getHitSlop("small")}
      disabled={disabled}
    >
      <View style={buttonStyle}>
        <FontAwesome5 name={icon} size={20} color={textColor} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    borderColor: colors.buttonBorder,
    borderRadius: 12,
    borderWidth: 0.5,
    height: 50,
    justifyContent: "center",
    padding: 12,
    width: 60,
    ...shadows.buttonShadow
  }
});
