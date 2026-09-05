import Svg, { Path } from "react-native-svg";

import { useCallback, useEffect, useRef } from "react";

import { Animated, Easing } from "react-native";

interface LoadingIndicatorProps {
  size?: number;
}

export function LoadingIndicator({ size = 100 }: LoadingIndicatorProps) {
  const strokeDashoffset = useRef(new Animated.Value(800)).current;

  const animate = useCallback(() => {
    Animated.sequence([
      Animated.timing(strokeDashoffset, {
        toValue: 0,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false
      }),
      Animated.timing(strokeDashoffset, {
        toValue: 800,
        duration: 0,
        useNativeDriver: false
      })
    ]).start(() => animate());
  }, [strokeDashoffset]);

  useEffect(() => {
    animate();
  }, [strokeDashoffset, animate]);

  return (
    <Svg width={size} height={size * 1.25} viewBox="0 0 72 87.93">
      <AnimatedPath
        d="M21.24,23.57c-2.97,2.8-1.64,8.05.54,10.91,5.44,7.11,16.66,6.89,22.33.14,7.55-8.98,3.14-23.44-5.58-29.84C23.87-5.98.42,4.76,4.63,24.43c1.06,4.95,3.81,8.13,6.97,11.79,2.45,2.84,8.05,7.09,5.49,11.43-1.34,2.27-7.71,4.55-10.18,6.09-10.25,6.39-6.64,18.91.1,26.55,8.66,9.82,22.52,9.57,30.3-1.15,7.39-10.19,7.93-37.77,24.58-36.07,4.06.41,10.51,5.34,7.24,9.78-3.59,4.87-14.59-1.66-19.57,4.9-3.29,4.33-1.53,14.56,5.37,12.05,5.36-4.63,15.76-6.85,16.51-15.1,1.06-11.59-10.5-21.56-21.64-18.49-15.41,4.24-15.32,32.65-30.99,38.64-5.9,2.26-14.58-.21-16.75-6.66-1.58-4.67,1.52-6.66,5.52-7.65,6.89-1.71,20.03,1.55,23.5-6.55,2.52-5.9-2.26-10.45-6.85-13.15-5.97-3.5-20.28-7.43-15.84-17.19,4.51-9.93,28.75-14.15,36.32-6.25,2.49,2.6,3.07,6.59-.11,8.9-5.94,4.31-12.74-2.41-18.54-3.71-1.72-.38-3.44-.29-4.81,1"
        stroke="#ffffff"
        strokeWidth={2}
        strokeDasharray="800"
        strokeDashoffset={strokeDashoffset}
        fill="none"
      />
      <AnimatedPath
        d="M21.24,23.57c1.36-1.28,3.08-1.38,4.81-1,5.81,1.3,12.61,8.02,18.54,3.71,3.18-2.31,2.6-6.3.11-8.9-7.57-7.9-31.81-3.67-36.32,6.25-4.44,9.76,9.87,13.68,15.84,17.19,4.6,2.7,9.38,7.25,6.85,13.15-3.47,8.11-16.61,4.84-23.5,6.55-4,1-7.1,2.98-5.52,7.65,2.18,6.45,10.85,8.92,16.75,6.66,15.67-5.99,15.59-34.39,30.99-38.64,11.14-3.07,22.7,6.9,21.64,18.49-.76,8.25-11.15,10.47-16.51,15.1-6.89,2.52-8.65-7.72-5.37-12.05,4.98-6.56,15.99-.04,19.57-4.9,3.27-4.44-3.18-9.36-7.24-9.78-16.64-1.7-17.19,25.88-24.58,36.07-7.78,10.72-21.63,10.97-30.3,1.15-6.74-7.64-10.35-20.16-.1-26.55,2.47-1.54,8.84-3.82,10.18-6.09,2.56-4.35-3.05-8.59-5.49-11.43-3.16-3.67-5.91-6.85-6.97-11.79C.41,4.74,23.87-6,38.53,4.76c8.71,6.4,13.12,20.86,5.58,29.84-5.67,6.75-16.9,6.97-22.33-.14-2.19-2.86-3.51-8.11-.54-10.91"
        stroke="#ffffff"
        strokeWidth={2}
        strokeDasharray="800"
        strokeDashoffset={strokeDashoffset}
        fill="none"
      />
    </Svg>
  );
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
