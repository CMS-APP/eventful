import { useCallback } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Badge } from "@/design-system/components/feedback/Badge";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { InAppNotification } from "@/types/InAppNotification";

interface HomeNotificationButtonProps {
  onPress: (notifications: InAppNotification[]) => void;
  notifications: InAppNotification[];
  icon: keyof typeof FontAwesome5.glyphMap;
  text: string;
  unreadNotifications: number;
  dark?: boolean;
}

export function HomeNotificationButton({
  onPress,
  notifications,
  icon,
  text,
  unreadNotifications,
  dark = false
}: HomeNotificationButtonProps) {
  const handlePress = useCallback(() => {
    onPress(notifications);
  }, [onPress, notifications]);

  const textColor = dark ? colors.white : colors.black;
  const iconStyle = {
    ...styles.iconContainer,
    ...(dark && styles.darkContainer)
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      hitSlop={getHitSlop("small")}
    >
      <View style={iconStyle}>
        <FontAwesome5 name={icon} size={20} color={textColor} />
        <Badge count={unreadNotifications} style={styles.badgeOffset} />
      </View>
      <Text type="body" color={colors.black}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badgeOffset: {
    height: 20,
    right: -4,
    top: -4
  },
  container: {
    alignItems: "center",
    gap: 6,
    justifyContent: "center"
  },
  darkContainer: {
    backgroundColor: colors.primary
  },
  iconContainer: {
    ...card.small,
    alignItems: "center",
    borderRadius: 120,
    height: 50,
    justifyContent: "center",
    width: 50
  }
});
