import { ActivityIndicator } from "react-native-paper";

import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/components/text/Text";
import { usePulsatingScale } from "@/hooks/usePulsatingScale";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";

interface ButtonProps {
  text: string;
  subText?: string;
  onPress: () => void;
  color: string;
  textColor: string;
  flex?: number;
  icon?: keyof typeof FontAwesome5.glyphMap;
  disabled?: boolean;
  pulsating?: boolean;
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
  pulsating = false,
  loading = false
}: ButtonProps) {
  const {
    scaleAnim,
    progressAnim,
    shadowStyle: pulsatingShadowStyle
  } = usePulsatingScale(pulsating && !disabled, {
    shadowColor: color
  });

  const handlePress = () => {
    onPress();
    haptics.soft();
  };

  const flexContainer = flex ? styles.flexContainer : undefined;

  const animatedOpacity = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.9]
  });

  const buttonStyle = [
    styles.button,
    {
      backgroundColor: color,
      opacity: pulsating ? animatedOpacity : 1,
      transform: pulsating ? [{ scale: scaleAnim }] : [],
      ...(pulsating && pulsatingShadowStyle ? pulsatingShadowStyle : {})
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
      <Animated.View style={buttonStyle}>
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
      </Animated.View>
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
