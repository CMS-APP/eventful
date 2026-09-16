import { StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { emailValid, getPasswordStrength } from "@/utils/validation";

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

const STRENGTH_BAR_COUNT = 4;
const STRENGTH_COLORS = [
  colors.lightGray,
  colors.red,
  colors.amber,
  colors.yellow,
  colors.green
];

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, label, message } = getPasswordStrength(password);
  const color = STRENGTH_COLORS[score];

  return (
    <View style={styles.meterContainer}>
      <View style={styles.barRow}>
        {Array.from({ length: STRENGTH_BAR_COUNT }, (_, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              { backgroundColor: index < score ? color : colors.lightGray }
            ]}
          />
        ))}
      </View>
      <View style={styles.labelRow}>
        <Text type="caption" color={colors.gray} style={styles.hintMessage}>
          {message || "Enter a password"}
        </Text>
        <Text type="caption" color={color} style={styles.strengthLabel}>
          {label}
        </Text>
      </View>
    </View>
  );
}

interface EmailValidationHintProps {
  email: string;
  error?: string | null;
}

export function EmailValidationHint({ email, error }: EmailValidationHintProps) {
  if (email.length === 0) {
    return (
      <View style={styles.container}>
        <Text type="caption" color={colors.gray}>
          Enter an email
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <RequirementRow label={error} met={false} />
      </View>
    );
  }

  const valid = emailValid(email);

  return (
    <View style={styles.container}>
      <RequirementRow
        label={valid ? "Valid email" : "Please enter a valid email address."}
        met={valid}
      />
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
  if (password.length === 0 && confirmPassword.length === 0) {
    return null;
  }

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  return (
    <View style={styles.container}>
      <RequirementRow label="Passwords match" met={passwordsMatch} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: 2,
    flex: 1,
    height: 4
  },
  barRow: {
    flexDirection: "row",
    gap: 4
  },
  container: {
    gap: 2,
    paddingLeft: 4,
    paddingTop: 2
  },
  hintMessage: {
    flex: 1
  },
  labelRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between"
  },
  meterContainer: {
    gap: 6,
    paddingTop: 6
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  strengthLabel: {
    flexShrink: 0,
    fontWeight: "700"
  }
});
