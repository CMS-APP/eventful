import { StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { shadows } from "@/design-system/tokens/shadows";

interface EmptyStateContainerProps {
  title: string;
  description: string;
  icon: keyof typeof FontAwesome5.glyphMap;
  dark?: boolean;
}

export function EmptyStateContainer({
  title,
  description,
  icon,
  dark = false
}: EmptyStateContainerProps) {
  const textColor = dark ? colors.white : colors.black;
  const backgroundColor = dark ? colors.primaryTint3 : colors.white;
  const borderColor = dark ? colors.primaryDark : colors.lightGray;

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <FontAwesome5 name={icon} size={24} color={textColor} />
      <Text type="subHeader" color={textColor} center>
        {title}
      </Text>
      <Text type="body" color={textColor} center>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...shadows.lightShadow,
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    justifyContent: "center",
    padding: 16
  }
});
