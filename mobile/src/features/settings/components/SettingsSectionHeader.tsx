import { StyleSheet } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

interface SettingsSectionHeaderProps {
  title: string;
}

export function SettingsSectionHeader({ title }: SettingsSectionHeaderProps) {
  return (
    <Text type="caption" color={colors.gray} style={styles.title}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    marginLeft: 4
  }
});
