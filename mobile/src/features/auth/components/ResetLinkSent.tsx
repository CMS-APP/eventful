import { StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { TextButton } from "@/design-system/components/buttons/TextButton";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

interface ResetLinkSentProps {
  email: string;
  resent: boolean;
  sending: boolean;
  onResend: () => void;
}

export function ResetLinkSent({
  email,
  resent,
  sending,
  onResend
}: ResetLinkSentProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <FontAwesome5 name="envelope" size={28} color={colors.primary} />
      </View>
      <Text type="header" color={colors.black} center>
        Check your inbox
      </Text>
      <Text type="body" color={colors.darkGray} center>
        If an account exists for{" "}
        <Text type="body" color={colors.primary} italic style={styles.email}>
          {email}
        </Text>
        , we&apos;ve sent a link to reset your password.
      </Text>
      <TextButton
        text={sending ? "Sending..." : resent ? "Sent again" : "Resend link"}
        textColor={colors.primary}
        textAlign="center"
        type="body"
        onPress={onResend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 12
  },
  email: {
    textTransform: "none"
  },
  iconContainer: {
    alignItems: "center",
    backgroundColor: colors.primaryTint + "33",
    borderRadius: 24,
    height: 72,
    justifyContent: "center",
    width: 72
  }
});
