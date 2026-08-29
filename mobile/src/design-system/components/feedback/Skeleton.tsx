import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";

import { useEffect } from "react";

import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";

import { colors } from "@/design-system/tokens/colors";

interface SkeletonProps {
  width: number;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width,
  height,
  borderRadius = 12,
  style
}: SkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius },
        animatedStyle,
        style
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.lightGray
  }
});
