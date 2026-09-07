import { StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

interface RequirementRowProps {
  label: string;
  met: boolean;
}

function RequirementRow({ label, met }: RequirementRowProps) {
  return (
    <View style={styles.row}>
      <FontAwesome5
        name={met ? "check" : "times"}
        size={12}
        color={met ? colors.green : colors.red}
      />
      <Text type="caption" color={met ? colors.green : colors.red}>
        {label}
      </Text>
    </View>
  );
}

interface PasswordStrengthChecksProps {
  password: string;
}

export function PasswordStrengthChecks({
  password
}: PasswordStrengthChecksProps) {
  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_-]/.test(password);

  return (
    <View style={styles.container}>
      <RequirementRow label="8 characters" met={hasLength} />
      <RequirementRow label="Number" met={hasNumber} />
      <RequirementRow label="Special character" met={hasSpecialChar} />
    </View>
  );
}

interface EmailValidationHintProps {
  message: string | null | undefined;
}

export function EmailValidationHint({ message }: EmailValidationHintProps) {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.container}>
      <RequirementRow label={message} met={false} />
    </View>
  );
}

interface PasswordMatchCheckProps {
  password: string;
  confirmPassword: string;
}

export function PasswordMatchCheck({
  password,
  confirmPassword
}: PasswordMatchCheckProps) {
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  return (
    <View style={styles.container}>
      <RequirementRow label="Passwords match" met={passwordsMatch} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
    paddingLeft: 4,
    paddingTop: 2
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  }
});
