import { useEffect, useRef } from "react";

import { Animated, StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

interface EventListProgressBarProps {
  doneCount: number;
  total: number;
}

export function EventListProgressBar({
  doneCount,
  total
}: EventListProgressBarProps) {
  const percentage = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const animatedWidth = useRef(new Animated.Value(percentage)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [animatedWidth, percentage]);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text type="caption" color={colors.white}>
          {`${doneCount} of ${total} done`}
        </Text>
        <Text type="caption" color={colors.white}>
          {`${percentage}%`}
        </Text>
      </View>

      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"]
              })
            }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginTop: 12
  },
  fill: {
    backgroundColor: colors.primary,
    borderRadius: 3,
    height: 6
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  track: {
    backgroundColor: colors.grayTint,
    borderRadius: 3,
    height: 6,
    overflow: "hidden"
  }
});
