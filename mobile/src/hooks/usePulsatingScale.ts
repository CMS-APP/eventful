import { useEffect, useRef } from "react";

import { Animated, Platform } from "react-native";

interface UsePulsatingScaleOptions {
  maxScale?: number;
  duration?: number;
  /** When set, the hook returns animated shadow style (radius + opacity) using this color */
  shadowColor?: string;
}

interface UsePulsatingScaleReturn {
  /** Use for transform: [{ scale: scaleAnim }] on Animated.View */
  scaleAnim: Animated.AnimatedInterpolation<number>;
  /** 0–1 progress for custom interpolations (e.g. content opacity) */
  progressAnim: Animated.Value;
  /** When shadowColor option is set: animated shadow style for iOS/Android */
  shadowStyle: Record<string, unknown> | undefined;
}

const DEFAULT_SHADOW_RADIUS = [10, 25] as const;
const DEFAULT_SHADOW_OPACITY = [0.4, 0.9] as const;

/**
 * Single loop (0→1→0) drives scale and optional glow/shadow.
 * Returns scale interpolation, progress value, and (when shadowColor is set) shadow style.
 */
export function usePulsatingScale(
  active: boolean,
  options: UsePulsatingScaleOptions = {}
): UsePulsatingScaleReturn {
  const { maxScale = 1.025, duration = 1000, shadowColor } = options;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      progressAnim.setValue(0);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true
        })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [active, duration, progressAnim]);

  const scaleAnim = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, maxScale]
  });

  const shadowStyle: Record<string, unknown> | undefined = shadowColor
    ? Platform.select({
        ios: {
          shadowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [...DEFAULT_SHADOW_RADIUS]
          }),
          shadowOpacity: progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [...DEFAULT_SHADOW_OPACITY]
          })
        },
        android: {
          elevation: 15
        },
        default: {}
      })
    : undefined;

  return { scaleAnim, progressAnim, shadowStyle };
}
