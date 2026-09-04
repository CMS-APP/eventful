import { ActivityIndicator } from "react-native-paper";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { TextType } from "@/design-system/tokens/text";
import { haptics } from "@/utils/haptics";

type buttonSizes = "small" | "medium" | "large";

type ButtonStyles = {
  padding: number;
  borderRadius: number;
  gap: number;
};

const buttonStyles: Record<buttonSizes, ButtonStyles> = {
  small: {
    padding: 12,
    borderRadius: 12,
    gap: 6
  },
  medium: {
    padding: 16,
    borderRadius: 16,
    gap: 6
  },
  large: {
    padding: 20,
    borderRadius: 20,
    gap: 8
  }
};

const iconSizes = {
  small: 16,
  medium: 20,
  large: 24
};

const buttonTextStyles = {
  small: "body",
  medium: "subHeader",
  large: "header"
};

type buttonAlign = "left" | "center" | "right";

const buttonAlignStyles: Record<
  buttonAlign,
  "flex-start" | "center" | "flex-end"
> = {
  left: "flex-start",
  center: "center",
  right: "flex-end"
};

interface ButtonProps {
  text: string;
  color: string;
  textColor: string;
  size?: buttonSizes;
  onPress: () => void;
  flex?: number | null;
  leadingIcon?: keyof typeof FontAwesome5.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  align?: buttonAlign;
}

export function Button({
  text,
  color,
  textColor,
  size = "medium",
  onPress,
  flex = 0,
  leadingIcon,
  disabled = false,
  loading = false,
  align = "center"
}: ButtonProps) {
  const handlePress = () => {
    onPress();
    haptics.soft();
  };

  const containerStyle =
    flex === null
      ? styles.compactContainer
      : flex
        ? [styles.container, styles.flexContainer]
        : styles.container;
  const buttonStyle = buttonStyles[size];
  let iconSize = iconSizes[size];

  if (leadingIcon === "apple") {
    iconSize *= 1.1;
  }

  const textStyle = buttonTextStyles[size];
  const gap = buttonStyles[size].gap;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={containerStyle}
      activeOpacity={0.5}
      hitSlop={getHitSlop("large")}
    >
      <View
        style={[
          styles.button,
          {
            backgroundColor: color,
            ...buttonStyle,
            alignItems: buttonAlignStyles[align]
          }
        ]}
      >
        <View style={[styles.textContainer, { gap }]}>
          {leadingIcon && (
            <FontAwesome5
              name={leadingIcon}
              size={iconSize}
              color={textColor}
            />
          )}
          <Text
            type={textStyle as TextType}
            color={textColor}
            style={styles.text}
          >
            {text}
          </Text>
          {loading && <ActivityIndicator size={iconSize} color={textColor} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRadius: 16,
    gap: 8,
    justifyContent: "center",
    padding: 16
  },
  compactContainer: {
    alignItems: "center",
    alignSelf: "flex-start"
  },
  container: {
    alignItems: "center",
    width: "100%"
  },
  flexContainer: {
    flex: 1,
    width: "auto"
  },
  text: {
    flexShrink: 1,
    textAlign: "center"
  },
  textContainer: {
    flexDirection: "row"
  }
});
