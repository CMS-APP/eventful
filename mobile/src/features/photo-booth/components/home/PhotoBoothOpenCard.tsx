import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { haptics } from "@/utils/haptics";

interface PhotoBoothOpenCardProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof FontAwesome5.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
  accentColor?: string;
  textColor?: string;
}

export function PhotoBoothOpenCard({
  title,
  subtitle,
  icon,
  onPress,
  disabled = false,
  color = colors.primary,
  accentColor = colors.secondary,
  textColor = colors.white
}: PhotoBoothOpenCardProps) {
  const handlePress = () => {
    onPress();
    haptics.soft();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      hitSlop={getHitSlop("large")}
    >
      <View style={[styles.container, { backgroundColor: color }]}>
        <View style={[styles.iconContainer, { backgroundColor: accentColor }]}>
          <FontAwesome5 name={icon} size={24} color={colors.white} />
        </View>

        <View style={styles.textContainer}>
          <Text type="subHeader" color={textColor} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text type="caption" color={textColor} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <FontAwesome5 name="arrow-right" size={20} color={textColor} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...card.small,
    alignItems: "center",
    borderRadius: 24,
    flexDirection: "row",
    gap: 16,
    padding: 16
  },
  iconContainer: {
    alignItems: "center",
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    width: 56
  },
  textContainer: {
    flex: 1,
    gap: 2
  }
});
