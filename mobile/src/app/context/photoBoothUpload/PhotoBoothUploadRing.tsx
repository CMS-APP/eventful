import Svg, { Circle, G } from "react-native-svg";

import { type ReactNode, useEffect, useRef } from "react";

import { Animated, StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PhotoBoothUploadRingProps {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  children?: ReactNode;
}

export function PhotoBoothUploadRing({
  percentage,
  color,
  size = 40,
  strokeWidth = 3,
  children
}: PhotoBoothUploadRingProps) {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const progress = useRef(new Animated.Value(clampedPercentage)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: clampedPercentage,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [clampedPercentage, progress]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0]
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G transform={`rotate(-90 ${center} ${center})`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.lightGray}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            fill="none"
          />
        </G>
      </Svg>

      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center"
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center"
  }
});
