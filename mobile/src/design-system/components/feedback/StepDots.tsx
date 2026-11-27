import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";

interface StepDotsProps {
  step: number;
  total: number;
  activeColor?: string;
  inactiveColor?: string;
}

export function StepDots({
  step,
  total,
  activeColor = colors.primary,
  inactiveColor = colors.lightGray
}: StepDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: index + 1 <= step ? activeColor : inactiveColor
            },
            index + 1 === step && styles.dotActive
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center"
  },
  dot: {
    borderRadius: 3,
    height: 6,
    width: 6
  },
  dotActive: {
    width: 24
  }
});
