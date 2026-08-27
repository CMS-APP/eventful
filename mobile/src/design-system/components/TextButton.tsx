import { useCallback } from "react";

import { StyleSheet, TouchableOpacity } from "react-native";

import { Text } from "@/design-system/components/Text";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { haptics } from "@/utils/haptics";

interface TextButtonProps {
  text: string;
  textColor: string;
  textAlign: "left" | "right" | "center";
  type: "body" | "subHeader";
  onPress: () => void;
  flex?: number | null;
}

export function TextButton({
  text,
  textColor,
  textAlign,
  type,
  onPress,
  flex = null
}: TextButtonProps) {
  const handlePress = useCallback(() => {
    haptics.soft();
    onPress();
  }, [onPress]);

  const textStyle = {
    ...styles.text,
    color: textColor,
    textAlign: textAlign
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{ flex: flex ?? undefined }}
      hitSlop={getHitSlop("small")}
    >
      <Text type={type} style={textStyle}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    paddingVertical: 6,
    textAlign: "right",
    textDecorationLine: "underline",
    textTransform: "capitalize"
  }
});
