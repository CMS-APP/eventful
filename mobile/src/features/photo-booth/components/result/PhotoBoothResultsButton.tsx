import { ActivityIndicator } from "react-native-paper";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/Text";
import { getHitSlop } from "@/utils/hitSlop";

interface PhotoBoothResultsButtonProps {
  onPress: () => void;
  icon: keyof typeof FontAwesome5.glyphMap;
  title: string;
  color: string;
  textColor: string;
  loading?: boolean;
}

export function PhotoBoothResultsButton({
  onPress,
  icon,
  title,
  color,
  textColor,
  loading = false
}: PhotoBoothResultsButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={styles.buttonContainer}
      hitSlop={getHitSlop("small")}
    >
      <View style={[styles.buttonView, { backgroundColor: color }]}>
        <Text type="body" style={{ color: textColor }}>
          {title}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <FontAwesome5 name={icon} size={20} color={textColor} />
        )}
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
