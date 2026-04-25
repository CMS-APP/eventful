import { useEffect, useRef } from "react";

import { Animated, Platform, StyleSheet } from "react-native";

interface PulsatingCircleProps {
  size: number;
  color: string;
  active: boolean;
}

export function PulsatingCircle({
  size,
  color,
  active
}: PulsatingCircleProps) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true // Changed to false for shadow properties
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      );
      glow.start();
      return () => glow.stop();
    }
  }, [active, glowAnim]);

  if (!active) return null;

  const animatedShadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 15]
  });

  const animatedOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.9]
  });

  return (
    <>
      {/* Outer glow layer with shadow */}
      <Animated.View
        style={[
          styles.glowCircle,
          {
            backgroundColor: color,
            borderRadius: (size + 16) / 2,
            height: size + 16,
            width: size + 16,
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.15, 0.35]
            }),
            ...Platform.select({
              ios: {
                shadowColor: color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: animatedOpacity,
                shadowRadius: animatedShadowRadius
              },
              android: {
                elevation: 8
              }
            })
          }
        ]}
      />
      {/* Middle glow layer */}
      <Animated.View
        style={[
          styles.glowCircle,
          {
            backgroundColor: color,
            borderRadius: (size + 8) / 2,
            height: size + 8,
            width: size + 8,
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.5]
            })
          }
        ]}
      />
      {/* Core ring */}
      <Animated.View
        style={[
          styles.coreCircle,
          {
            borderColor: color,
            borderRadius: size / 2,
            height: size,
            width: size,
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 0.8]
            })
          }
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  coreCircle: {
    borderWidth: 2,
    position: "absolute"
  },
  glowCircle: {
    position: "absolute"
  }
});
