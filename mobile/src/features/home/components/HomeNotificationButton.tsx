import { useCallback } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { InAppNotification } from "@/types/InAppNotification";

interface HomeNotificationButtonProps {
  onPress: (notifications: InAppNotification[]) => void;
  notifications: InAppNotification[];
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

        {unreadNotifications > 0 && (
          <View style={styles.badge}>
            <Text type="subHeader" style={styles.badgeText} center>
              {unreadNotifications}
            </Text>
          </View>
        )}
      </View>

      <Text type="body" color={colors.black}>
        {text}
      </Text>
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
    paddingHorizontal: 6,
    position: "absolute",
    right: -4,
    top: -4
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    left: 0.5
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
  }
});
