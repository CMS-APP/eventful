import { StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { colors } from "@/styles/colors";

import { Text } from "../text/Text";

interface EmptyStateContainerProps {
  title: string;
  description: string;
  icon: keyof typeof FontAwesome5.glyphMap;
}

export function EmptyStateContainer({
  title,
  description,
  icon
}: EmptyStateContainerProps) {
  return (
    <View style={styles.container}>
      <FontAwesome5 name={icon} size={24} color={colors.black} />
      <Text type="subHeader" color={colors.black} center>
        {title}
      </Text>
      <Text type="body" color={colors.black} center>
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
