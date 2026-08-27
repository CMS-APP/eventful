import { ActivityIndicator } from "react-native-paper";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/Text";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { haptics } from "@/utils/haptics";

interface ButtonProps {
  text: string;
  subText?: string;
  onPress: () => void;
  color: string;
  textColor: string;
  flex?: number;
  icon?: keyof typeof FontAwesome5.glyphMap;
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  text,
  subText,
  onPress,
  color,
  textColor,
  flex = 0,
  icon,
  disabled = false,
  loading = false
}: ButtonProps) {
  const handlePress = () => {
    onPress();
    haptics.soft();
  };

  const flexContainer = flex ? styles.flexContainer : undefined;

  const buttonStyle = [
    styles.button,
    {
      backgroundColor: color
    }
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={[styles.container, flexContainer]}
      activeOpacity={0.5}
      hitSlop={getHitSlop("large")}
    >
      <View style={buttonStyle}>
        <View style={styles.textContainer}>
          {icon && <FontAwesome5 name={icon} size={20} color={textColor} />}
          <Text type="subHeader" color={textColor} style={styles.text}>
            {text}
          </Text>
          {loading && (
            <ActivityIndicator
              size="small"
              color={textColor}
              style={styles.loading}
            />
          )}
        </View>
        {subText && (
          <Text type="body" color={textColor} style={styles.text}>
            {subText}
          </Text>
        )}
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
  container: {
    alignItems: "center",
    width: "100%"
  },
  flexContainer: {
    flex: 1,
    width: "auto"
  },
  loading: {
    height: 20,
    width: 20
  },
  text: {
    flexShrink: 1,
    textAlign: "center"
  },
  textContainer: {
    flexDirection: "row",
    gap: 12
  }
});
