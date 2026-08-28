import { StyleSheet } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Badge } from "@/design-system/components/feedback/Badge";
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
      <Badge count={notifications} style={styles.badgeOffset} />
    </>
  );
}

const styles = StyleSheet.create({
  badgeOffset: {
    right: -12,
    top: -8
  }
});
