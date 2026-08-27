import { useCallback } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/Text";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { haptics } from "@/utils/haptics";

interface SectionButtonProps {
  onPress: (title: string) => void;
  title: string;
  icon: keyof typeof FontAwesome5.glyphMap;
  color: string;
}

export function SectionButton({
  onPress,
  title,
  icon,
  color
}: SectionButtonProps) {
  const handlePress = useCallback(() => {
    haptics.soft();
    onPress(title);
  }, [onPress, title]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        style={styles.buttonTouchable}
        hitSlop={getHitSlop("medium")}
      >
        <View style={[styles.button, { backgroundColor: color + "33" }]}>
          <FontAwesome5
            name={icon}
            size={40}
            color={color}
            style={styles.icon}
          />
        </View>
      </TouchableOpacity>
      <Text type="body">{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 16,
    justifyContent: "center",
    paddingVertical: 24
  },
  buttonTouchable: {
    flex: 1,
    width: "100%"
  },
  container: {
    alignItems: "center",
    flex: 1,
    gap: 4,
    width: "100%"
  },
  icon: {
    textAlign: "center"
  }
});
