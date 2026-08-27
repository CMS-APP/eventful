import { StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";

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

  return (
    <>
      <FontAwesome5 name={iconName} size={24} color={iconColor} />
      {notifications > 0 && (
        <View style={styles.badge}>
          <Text type="subHeader" style={styles.badgeText} center>
            {notifications}
          </Text>
        </View>
      )}
    </>
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
    right: -12,
    top: -8
  },
  badgeText: {
    color: colors.white,
    fontSize: 12
  }
});
