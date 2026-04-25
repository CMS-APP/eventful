import { Animated, StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/components/text/Text";
import { colors } from "@/styles/colors";

const iconNames = {
  Home: "home",
  Contacts: "users",
  Inspiration: "lightbulb",
  Calendar: "calendar",
  Events: "book",
  Account: "user"
};

interface MainTabBarIconProps {
  route: string;
  isFocused: boolean;
  notifications: number;
}

export function MainTabBarIcon({
  route,
  isFocused,
  notifications
}: MainTabBarIconProps) {
  const iconName = iconNames[route as keyof typeof iconNames];
  const iconColor = isFocused ? colors.secondary : colors.black;
  const scale = new Animated.Value(1);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <FontAwesome5 name={iconName} size={24} color={iconColor} />
      {notifications > 0 && (
        <View style={styles.badge}>
          <Text type="body" style={styles.badgeText}>
            {notifications}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 12,
    height: 20,
    justifyContent: "center",
    minWidth: 20,
    paddingHorizontal: 6,
    position: "absolute",
    right: -5,
    top: -5
  },
  badgeText: {
    color: colors.white
  }
});
