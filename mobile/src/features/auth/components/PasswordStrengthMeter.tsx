import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getPasswordStrength } from "@/utils/validation";

const STRENGTH_BAR_COUNT = 4;
const STRENGTH_COLORS = [
  colors.lightGray,
  colors.red,
  colors.amber,
  colors.yellow,
  colors.primaryTint
];

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({
  password
}: PasswordStrengthMeterProps) {
  const { score, message } = getPasswordStrength(password);
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
      {message && (
        <Text type="caption" color={colors.gray}>
          {message}
        </Text>
      )}
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
  meterContainer: {
    gap: 6,
    paddingTop: 6
  }
});
