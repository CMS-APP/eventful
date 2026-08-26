import Svg, { Circle, G } from "react-native-svg";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";

import { Animated, Easing, StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type TimerRingHandle = {
  start: () => void;
  stop: () => void;
  reset: () => void;
};

type TimerRingProps = {
  durationMs: number;
  onComplete?: () => void;
  onStart?: () => void;
  size?: number;
  strokeWidth?: number;
  showCountdownLabel?: boolean;
};

const TimerRing = forwardRef<TimerRingHandle, TimerRingProps>(
  function TimerRing(
    {
      durationMs,
      onComplete,
      onStart,
      size = 96,
      strokeWidth = 5,
      showCountdownLabel = true
    },
    ref
  ) {
    const R = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * R;
    const center = size / 2;

    const progress = useRef(new Animated.Value(0)).current;
    const runGeneration = useRef(0);

    const onCompleteRef = useRef(onComplete);
    const onStartRef = useRef(onStart);
    onCompleteRef.current = onComplete;
    onStartRef.current = onStart;

    const [labelSeconds, setLabelSeconds] = useState(0);

    useImperativeHandle(
      ref,
      () => ({
        start: () => {
          runGeneration.current += 1;
          const gen = runGeneration.current;
          progress.stopAnimation();
          progress.setValue(0);
          setLabelSeconds(Math.ceil(durationMs / 1000));
          onStartRef.current?.();

          Animated.timing(progress, {
            toValue: 1,
            duration: durationMs,
            easing: Easing.linear,
            useNativeDriver: false
          }).start(({ finished }) => {
            if (!finished || gen !== runGeneration.current) return;
            onCompleteRef.current?.();
            progress.setValue(0);
          });
        },
        stop: () => {
          runGeneration.current += 1;
          progress.stopAnimation();
        },
        reset: () => {
          runGeneration.current += 1;
          progress.stopAnimation();
          progress.setValue(0);
          setLabelSeconds(0);
        }
      }),
      [durationMs, progress]
    );

    useEffect(() => {
      if (!showCountdownLabel) return;

      let lastWhole = -1;
      const id = progress.addListener(({ value }) => {
        const whole = Math.max(0, Math.ceil((1 - value) * (durationMs / 1000)));
        if (whole !== lastWhole) {
          lastWhole = whole;
          setLabelSeconds(whole);
        }
      });

      return () => progress.removeListener(id);
    }, [durationMs, progress, showCountdownLabel]);

    const strokeDashoffset = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [circumference, 0]
    });

    if (labelSeconds === 0) {
      return <View />;
    }

    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G transform={`rotate(-90 ${center} ${center})`}>
            <Circle
              cx={center}
              cy={center}
              r={R}
              stroke={colors.white}
              strokeOpacity={0.25}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <AnimatedCircle
              cx={center}
              cy={center}
              r={R}
              stroke={colors.secondary}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </G>
        </Svg>
        {showCountdownLabel && labelSeconds > 0 ? (
          <View style={styles.labelWrap} pointerEvents="none">
            <Text type="header" color={colors.white}>
              {labelSeconds}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }
);

export { TimerRing };

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center"
  },
  labelWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8
  }
});
