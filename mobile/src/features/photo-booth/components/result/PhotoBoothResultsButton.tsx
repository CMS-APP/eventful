import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/components/text/Text";
import { getHitSlop } from "@/utils/hitSlop";

interface PhotoBoothResultsButtonProps {
  onPress: () => void;
  icon: keyof typeof FontAwesome5.glyphMap;
  title: string;
  color: string;
  textColor: string;
}

export function PhotoBoothResultsButton({
  onPress,
  icon,
  title,
  color,
  textColor
}: PhotoBoothResultsButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.buttonContainer}
      hitSlop={getHitSlop("small")}
    >
      <View style={[styles.buttonView, { backgroundColor: color }]}>
        <Text type="body" style={{ color: textColor }}>
          {title}
        </Text>
        <FontAwesome5 name={icon} size={20} color={textColor} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    justifyContent: "center"
  },
  buttonView: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "column",
    gap: 2.5,
    justifyContent: "space-between",
    paddingHorizontal: 0,
    paddingVertical: 10
  }
});
