import { useCallback } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";

interface SmallButtonProps {
  text: string;
  onPress: () => void;
  color: string;
  textColor: string;
  textAlign?: "center" | "left" | "right";
  flex?: number;
  icon?: keyof typeof FontAwesome5.glyphMap;
  disabled?: boolean;
}

export function SmallButton({
  text,
  onPress,
  color,
  textColor,
  textAlign = "center",
  flex = 0,
  icon,
  disabled = false
}: SmallButtonProps) {
  const handlePress = useCallback(() => {
    onPress();
    haptics.soft();
  }, [onPress]);

  const flexContainer = flex ? styles.flexContainer : undefined;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={flexContainer}
      hitSlop={getHitSlop("medium")}
    >
      <View style={[styles.button, { backgroundColor: color }]}>
        {icon && (
          <View style={styles.iconStyle}>
            <FontAwesome5 name={icon} size={24} color={color} />
          </View>
        )}
        <Text type="body" style={{ color: textColor, textAlign }}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    padding: 8
  },
  flexContainer: {
    flex: 1,
    width: "auto"
  },
  iconStyle: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 12
  }
});
