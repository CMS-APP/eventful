import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { type ReactNode } from "react";

import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";

import { FontAwesome } from "@expo/vector-icons";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";

import { usePanSnapContext } from "./panSnapContext";

type PanSnapScrollHintProps = {
  labels: string[];
  header?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function PanSnapScrollHint({ labels, header }: PanSnapScrollHintProps) {
  const { activeIndex, count, itemCount, layoutWidth, pageWidth, translateX } =
    usePanSnapContext();

  const rowStyle = useAnimatedStyle(() => {
    const w = pageWidth.value;
    const n = itemCount.value;
    return {
      flexDirection: "row" as const,
      transform: [{ translateX: translateX.value }],
      width: w * n
    };
  });

  const w = layoutWidth;

  return (
    <View style={styles.bottomViewport}>
      {header}
      {w > 0 ? (
        <Animated.View style={rowStyle}>
          {labels.map((label, index) => (
            <View
              key={`${label}-${index}`}
              style={[styles.pageSticky, { width: w }]}
            >
              <Text type="header" color={colors.primary}>
                {label}
              </Text>
            </View>
          ))}
        </Animated.View>
      ) : null}

      <View style={styles.scrollIndicator}>
        <View style={styles.arrowIconContainer}>
          {activeIndex > 0 && (
            <FontAwesome name="arrow-left" size={16} color={colors.primary} />
          )}
        </View>
        <Text type="body" color={colors.primary}>
          Swipe for filters
        </Text>
        <View style={styles.arrowIconContainer}>
          {activeIndex < count - 1 && (
            <FontAwesome name="arrow-right" size={16} color={colors.primary} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  arrowIconContainer: {
    alignItems: "center",
    height: 20,
    justifyContent: "center",
    width: 20
  },
  bottomViewport: {
    borderTopColor: colors.grayTint,
    borderTopWidth: 1,
    gap: 6,
    overflow: "hidden",
    paddingTop: 12
  },
  pageSticky: {
    alignItems: "center",
    justifyContent: "center"
  },
  scrollIndicator: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center"
  }
});
