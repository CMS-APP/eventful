import { forwardRef, useImperativeHandle, useRef } from "react";

import { StyleSheet, View } from "react-native";

import { useAppDimensions } from "@/app/hooks/useAppDimensions";

import { TimerRing, TimerRingHandle } from "./TimerRing";

const DEFAULT_CYCLE_MS = 4000;

export type PhotoBoothTimerHandle = TimerRingHandle;

type PhotoBoothTimerProps = {
  durationMs?: number;
  onComplete?: () => void;
};

const PhotoBoothTimer = forwardRef<PhotoBoothTimerHandle, PhotoBoothTimerProps>(
  function PhotoBoothTimer({ durationMs = DEFAULT_CYCLE_MS, onComplete }, ref) {
    const ringRef = useRef<TimerRingHandle>(null);
    const { screenHeight } = useAppDimensions();

    const topLength = screenHeight * 0.5 - 96 / 2;

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
      <View style={[styles.wrap, { top: topLength }]}>
        <TimerRing
          ref={ringRef}
          durationMs={durationMs}
          onComplete={onComplete}
          size={96}
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
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0
  }
});
