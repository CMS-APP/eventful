import { StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { colors } from "@/design-system/tokens/colors";

import { Text } from "../../design-system/components/Text";

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
  const backgroundColor = dark ? colors.primaryTint : colors.lightGray;

  return (
    <View style={[styles.container, { backgroundColor }]}>
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
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    gap: 4,
    justifyContent: "center",
    padding: 16
  }
});
