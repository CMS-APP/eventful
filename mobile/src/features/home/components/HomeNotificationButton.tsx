import { useCallback } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { Notification } from "@/types/Notification";
import { getHitSlop } from "@/utils/hitSlop";

interface HomeNotificationButtonProps {
  onPress: (notifications: Notification[]) => void;
  notifications: Notification[];
  icon: keyof typeof FontAwesome5.glyphMap;
  text: string;
  unreadNotifications: number;
}

export function HomeNotificationButton({
  onPress,
  notifications,
  icon,
  text,
  unreadNotifications
}: HomeNotificationButtonProps) {
  const handlePress = useCallback(() => {
    onPress(notifications);
  }, [onPress, notifications]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      hitSlop={getHitSlop("small")}
    >
      <View style={styles.iconContainer}>
        <FontAwesome5 name={icon} size={20} color={colors.black} />
      </View>

      <Text type="body" color={colors.black}>
        {text}
      </Text>

      {unreadNotifications > 0 && (
        <View style={styles.badge}>
          <Text type="header" style={styles.badgeText} center>
            {unreadNotifications}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 20,
    justifyContent: "center",
    minWidth: 24,
    paddingHorizontal: 6,
    position: "absolute",
    right: -4,
    top: -4
  },
  container: {
    alignItems: "center",
    gap: 6,
    justifyContent: "center"
  },
  iconContainer: {
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 120,
    height: 50,
    justifyContent: "center",
    width: 50
  },
  badgeText: {
    color: colors.white,
    fontSize: 12
  }
});
