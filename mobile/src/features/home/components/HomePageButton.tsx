import { useCallback } from "react";

import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { haptics } from "@/utils/haptics";

interface HomePageButtonProps {
  icon: keyof typeof FontAwesome5.glyphMap;
  color: string;
  text: string;
  textColor: string;
  buttonAction: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function HomePageButton({
  icon,
  color,
  text,
  textColor,
  buttonAction,
  style,
  disabled
}: HomePageButtonProps) {
  const handlePress = useCallback(() => {
    haptics.soft();
    buttonAction();
  }, [buttonAction]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.flexContainer}
      hitSlop={getHitSlop("medium")}
      disabled={disabled}
    >
      <View style={[styles.container, { backgroundColor: color }, style]}>
        <FontAwesome5 name={icon} size={48} color={textColor} />
        <Text type="body" color={textColor}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: 24,
    gap: 12,
    justifyContent: "center",
    paddingVertical: 24
  },
  flexContainer: {
    flex: 1
  }
});
