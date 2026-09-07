import Animated, {
  Easing,
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState
} from "react";

import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";

const DEFAULT_COLORS = [
  colors.secondary,
  colors.secondaryDark,
  colors.primaryTint,
  colors.tertiary,
  colors.white
];

const GRAVITY = 800;
const DURATION_MS = 1400;

export interface ConfettiHandle {
  play: () => void;
}

interface ConfettiProps {
  count?: number;
  colors?: string[];
  originX?: number;
  originY?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  color: string;
  width: number;
  height: number;
  isCircle: boolean;
  vx: number;
  vy: number;
  initialRotation: number;
  spinSpeed: number;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createParticles(count: number, palette: string[]): Particle[] {
  return Array.from({ length: count }).map((_, id) => {
    const isCircle = Math.random() < 0.35;
    const size = randomBetween(6, 11);

    return {
      id,
      color: palette[Math.floor(Math.random() * palette.length)],
      width: size,
      height: isCircle ? size : size * 1.6,
      isCircle,
      vx: randomBetween(-140, 140),
      vy: randomBetween(-1000, -800),
      initialRotation: randomBetween(0, 360),
      spinSpeed: randomBetween(-200, 200)
    };
  });
}

export const Confetti = forwardRef<ConfettiHandle, ConfettiProps>(
  function Confetti(
    {
      count = 26,
      colors: palette = DEFAULT_COLORS,
      originX = 0.5,
      originY = 1,
      autoPlay = false,
      onComplete
    },
    ref
  ) {
    const progress = useSharedValue(0);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [active, setActive] = useState(false);

    const play = useCallback(() => {
      setParticles(createParticles(count, palette));
      setActive(true);
      progress.value = 0;
      progress.value = withTiming(
        1,
        { duration: DURATION_MS, easing: Easing.linear },
        (finished) => {
          if (finished) {
            runOnJS(setActive)(false);
            if (onComplete) {
              runOnJS(onComplete)();
            }
          }
        }
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count, palette, onComplete]);

    useImperativeHandle(ref, () => ({ play }), [play]);

    useEffect(() => {
      if (autoPlay) {
        play();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!active) {
      return null;
    }

    return (
      <View style={styles.container} pointerEvents="none">
        {particles.map((particle) => (
          <ConfettiParticle
            key={particle.id}
            particle={particle}
            progress={progress}
            originX={originX}
            originY={originY}
          />
        ))}
      </View>
    );
  }
);

interface ConfettiParticleProps {
  particle: Particle;
  progress: SharedValue<number>;
  originX: number;
  originY: number;
}

function ConfettiParticle({
  particle,
  progress,
  originX,
  originY
}: ConfettiParticleProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value * (DURATION_MS / 1000);

    const x = particle.vx * t;
    const y = particle.vy * t + 0.5 * GRAVITY * t * t;

    const rotate = particle.initialRotation + particle.spinSpeed * t;

    const opacity = interpolate(
      progress.value,
      [0, 0.7, 1],
      [1, 1, 0],
      "clamp"
    );

    return {
      opacity,
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${rotate}deg` }
      ]
    };
  });

  const borderRadius = particle.isCircle ? particle.width / 2 : 2;

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: `${originX * 100}%`,
          top: `${originY * 100}%`,
          width: particle.width,
          height: particle.height,
          borderRadius,
          backgroundColor: particle.color
        },
        animatedStyle
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999
  },
  particle: {
    position: "absolute"
  }
});
