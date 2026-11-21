import { StyleSheet, View } from "react-native";

import { TextButton } from "@/design-system/components/buttons/TextButton";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

interface AuthSwitchLinkProps {
  prompt: string;
  action: string;
  onPress: () => void;
}

export function AuthSwitchLink({
  prompt,
  action,
  onPress
}: AuthSwitchLinkProps) {
  return (
    <View style={styles.container}>
      <Text type="body" color={colors.darkGray}>
        {prompt}
      </Text>
      <TextButton
        text={action}
        textColor={colors.primary}
        textAlign="center"
        type="body"
        onPress={onPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center"
  }
});
