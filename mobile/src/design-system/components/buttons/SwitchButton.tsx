import { useCallback } from "react";

import { Pressable, StyleSheet, Switch, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { haptics } from "@/utils/haptics";

interface SwitchButtonProps {
  icon?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: () => void;
}

export function SwitchButton({
  icon,
  iconColor,
  title,
  subtitle,
  value,
  onChange
}: SwitchButtonProps) {
  const handlePress = useCallback(() => {
    haptics.soft();
    onChange();
  }, [onChange]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => pressed && styles.pressed}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={title}
    >
      <View style={styles.row}>
        {icon && (
          <View style={styles.iconContainer}>
            <FontAwesome5
              name={icon}
              size={15}
              color={iconColor ?? colors.primary}
              solid
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text type="body" color={colors.black}>
            {title}
          </Text>
          {subtitle && (
            <Text
              type="footnote"
              color={colors.primaryTint3}
              style={styles.subtitle}
            >
              {subtitle}
            </Text>
          )}
        </View>
        <View style={styles.switchContainer}>
          <Switch
            value={value}
            onValueChange={handlePress}
            trackColor={{ true: colors.primary }}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    width: 20
  },
  pressed: {
    opacity: 0.5
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 60,
    paddingVertical: 8
  },
  subtitle: {
    fontSize: 9,
    lineHeight: 13
  },
  switchContainer: {
    alignSelf: "stretch",
    justifyContent: "center"
  },
  textContainer: {
    flex: 1,
    gap: 2
  }
});
