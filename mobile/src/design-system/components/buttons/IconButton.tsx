import { useCallback } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { padding } from "@/design-system/tokens/padding";
import { haptics } from "@/utils/haptics";

interface IconButtonProps {
  iconName: keyof typeof FontAwesome5.glyphMap;
  onPress: () => void;
  color?: string;
  marginTop?: number;
  marginBottom?: number;
  position?: "relative" | "absolute";
  left?: number | null;
  right?: number | null;
  top?: number | null;
  bottom?: number | null;
  size?: "small" | "medium" | "large";
}

export function IconButton({
  iconName,
  onPress,
  color = colors.white,
  marginTop = 15,
  marginBottom = 15,
  position = "relative",
  left = 0,
  right = 0,
  top = 0,
  bottom = 0,
  size = "small"
}: IconButtonProps) {
  const absolutePosition = useCallback(() => {
    return {
      position,
      left,
      right,
      top,
      bottom,
      zIndex: 10
    };
  }, [position, left, right, top, bottom]);

  const handlePress = useCallback(() => {
    haptics.soft();
    onPress();
  }, [onPress]);

  const sizes = {
    small: 20,
    medium: 30,
    large: 40
  };

  const widths = {
    small: 40,
    medium: 60,
    large: 80
  };

  const buttonStyle = {
    backgroundColor: color,
    width: widths[size],
    height: widths[size]
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        position === "absolute"
          ? absolutePosition()
          : {
              marginTop,
              marginBottom
            },
        styles.button
      ]}
      hitSlop={getHitSlop(
        size === "large" ? "large" : size === "medium" ? "medium" : "small"
      )}
    >
      <View style={[styles.buttonInner, buttonStyle]}>
        <FontAwesome5
          name={iconName}
          size={sizes[size]}
          color={
            color === colors.white || color === colors.lightGray
              ? colors.black
              : colors.white
          }
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "flex-start"
  },
  buttonInner: {
    ...card.small,
    ...padding.smallWidget,
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 12,
    justifyContent: "center"
  }
});
