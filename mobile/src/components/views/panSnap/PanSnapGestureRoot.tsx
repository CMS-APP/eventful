import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS, useSharedValue, withSpring } from "react-native-reanimated";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { type LayoutChangeEvent, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";

import { PanSnapContext } from "./panSnapContext";

const SPRING = { damping: 22, stiffness: 220, mass: 0.8 };

type PanSnapGestureRootProps = {
  children?: ReactNode;
  count: number;
  /** Clamped to `[0, count - 1]`. Syncs pan offset when layout is known or this value changes. */
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
};

export function PanSnapGestureRoot({
  children,
  count,
  initialIndex = 0,
  onIndexChange,
  style
}: PanSnapGestureRootProps) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const pageWidth = useSharedValue(0);
  const itemCount = useSharedValue(count);

  const [layoutWidth, setLayoutWidth] = useState(0);

  const clampedInitial = useMemo(() => {
    if (count < 1) return 0;
    return Math.max(0, Math.min(initialIndex, count - 1));
  }, [count, initialIndex]);

  const [activeIndex, setActiveIndex] = useState(clampedInitial);

  const onIndexChangeRef = useRef(onIndexChange);
  onIndexChangeRef.current = onIndexChange;

  useEffect(() => {
    setActiveIndex(clampedInitial);
  }, [clampedInitial]);

  useEffect(() => {
    itemCount.value = count;
  }, [count, itemCount]);

  useEffect(() => {
    if (layoutWidth < 1 || count < 1) return;
    translateX.value = -clampedInitial * layoutWidth;
    onIndexChangeRef.current?.(clampedInitial);
  }, [clampedInitial, count, layoutWidth, translateX]);

  const emitIndex = useCallback((idx: number) => {
    setActiveIndex(idx);
    onIndexChangeRef.current?.(idx);
  }, []);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      setLayoutWidth(w);
      pageWidth.value = w;
    },
    [pageWidth]
  );

  const panGesture = useMemo(() => {
    const n = count;
    return Gesture.Pan()
      .failOffsetY([-12, 12])
      .activeOffsetX([-24, 24])
      .onBegin(() => {
        startX.value = translateX.value;
      })
      .onUpdate((e) => {
        const w = pageWidth.value;
        if (w < 1) return;
        const minX = -(n - 1) * w;
        let next = startX.value + e.translationX;
        if (next > 0) next *= 0.35;
        if (next < minX) next = minX + (next - minX) * 0.35;
        translateX.value = next;
      })
      .onEnd((e) => {
        const w = pageWidth.value;
        if (w < 1) return;
        const vx = e.velocityX;
        let idx = Math.round(-translateX.value / w);
        if (vx < -400) idx = Math.ceil(-translateX.value / w);
        if (vx > 400) idx = Math.floor(-translateX.value / w);
        idx = Math.max(0, Math.min(n - 1, idx));
        translateX.value = withSpring(-idx * w, SPRING);
        runOnJS(emitIndex)(idx);
      });
  }, [count, emitIndex, pageWidth, startX, translateX]);

  const contextValue = useMemo(
    () => ({
      activeIndex,
      count,
      itemCount,
      layoutWidth,
      pageWidth,
      translateX
    }),
    [activeIndex, count, itemCount, layoutWidth, pageWidth, translateX]
  );

  return (
    <PanSnapContext.Provider value={contextValue}>
      <GestureDetector gesture={panGesture}>
        <View style={[styles.root, style]} onLayout={onLayout}>
          {children}
        </View>
      </GestureDetector>
    </PanSnapContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});
