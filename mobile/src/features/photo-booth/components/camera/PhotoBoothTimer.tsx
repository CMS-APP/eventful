import { forwardRef, useImperativeHandle, useRef } from "react";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StyleSheet, View } from "react-native";

import { useAppDimensions } from "@/app/hooks/useAppDimensions";

import { PhotoPromptBanner } from "./PhotoPromptBanner";
import { TimerRing, TimerRingHandle } from "./TimerRing";

const DEFAULT_CYCLE_MS = 4000;
export const TIMER_RING_SIZE = 96;

export type PhotoBoothTimerHandle = TimerRingHandle;

type PhotoBoothTimerProps = {
  durationMs?: number;
  onComplete?: () => void;
  prompt?: string;
};

const PhotoBoothTimer = forwardRef<PhotoBoothTimerHandle, PhotoBoothTimerProps>(
  function PhotoBoothTimer(
    { durationMs = DEFAULT_CYCLE_MS, onComplete, prompt },
    ref
  ) {
    const ringRef = useRef<TimerRingHandle>(null);
    const { screenHeight } = useAppDimensions();
    const insets = useSafeAreaInsets();

    // Anchored to the ring's bottom edge (not its center) so the ring's
    // position never moves whether or not a prompt is shown above it — the
    // prompt and ring are children of one column that grows upward from
    // this fixed point, so "prompt sits above the ring" is guaranteed by
    // normal layout instead of two components independently computing
    // matching absolute positions.
    const safeHeight = screenHeight - insets.top - insets.bottom;
    const ringCenter = insets.top + safeHeight * 0.5;
    const bottomOffset = screenHeight - (ringCenter + TIMER_RING_SIZE / 2);

    useImperativeHandle(
      ref,
      () => ({
        start: () => ringRef.current?.start(),
        stop: () => ringRef.current?.stop(),
        reset: () => ringRef.current?.reset()
      }),
      []
    );

    return (
      <View style={[styles.wrap, { bottom: bottomOffset }]}>
        {prompt ? <PhotoPromptBanner prompt={prompt} /> : null}
        <TimerRing
          ref={ringRef}
          durationMs={durationMs}
          onComplete={onComplete}
          size={TIMER_RING_SIZE}
          strokeWidth={5}
        />
      </View>
    );
  }
);

export { PhotoBoothTimer };

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: 0
  }
});
