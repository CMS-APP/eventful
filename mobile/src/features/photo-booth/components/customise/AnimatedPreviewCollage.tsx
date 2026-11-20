import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

import { useEffect, useMemo, useRef, useState } from "react";

import { type LayoutChangeEvent, StyleSheet, View } from "react-native";

import { useAppDimensions } from "@/app/hooks/useAppDimensions";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

import { PhotoBoothText } from "../result/PhotoBoothText";
import { COLLAGE_BASE_WIDTH } from "../result/collageScale";
import { AnimatedSlot } from "./AnimatedSlot";
import {
  PREVIEW_TIMING,
  type TextCollage,
  getCollageGeometry
} from "./collageGeometry";

const BACKGROUND_SIZE = 100;

type AnimatedPreviewCollageProps = {
  horizontalPadding: number;
  maxHeight: number;
};

export function AnimatedPreviewCollage({
  horizontalPadding,
  maxHeight
}: AnimatedPreviewCollageProps) {
  const { screenWidth } = useAppDimensions();
  const { collageStyle, filter, frameColor, flipPhotosHorizontally } =
    usePhotoBoothSettings();

  const boxWidth = screenWidth - horizontalPadding;
  const geometry = useMemo(
    () => getCollageGeometry(collageStyle),
    [collageStyle]
  );
  const [textHeights, setTextHeights] = useState<
    Partial<Record<TextCollage, number>>
  >({});
  const hasShown = useRef(false);

  const measuredTextHeight = textHeights[geometry.textCollage];
  const isReady = Object.keys(textHeights).length > 0;
  const frameHeight =
    geometry.textTop + (measuredTextHeight ?? 0) + geometry.padding;
  const scale = Math.min(
    screenWidth / COLLAGE_BASE_WIDTH,
    boxWidth / geometry.frameWidth,
    maxHeight / frameHeight
  );

  const frameWidthValue = useSharedValue(geometry.frameWidth);
  const frameHeightValue = useSharedValue(frameHeight);
  const scaleValue = useSharedValue(scale);
  const textTopValue = useSharedValue(geometry.textTop);

  useEffect(() => {
    if (measuredTextHeight === undefined) return;

    const animate = hasShown.current;
    hasShown.current = true;
    const to = (value: number) =>
      animate ? withTiming(value, PREVIEW_TIMING) : value;

    frameWidthValue.value = to(geometry.frameWidth);
    frameHeightValue.value = to(frameHeight);
    scaleValue.value = to(scale);
    textTopValue.value = to(geometry.textTop);
  }, [
    geometry,
    frameHeight,
    scale,
    measuredTextHeight,
    frameWidthValue,
    frameHeightValue,
    scaleValue,
    textTopValue
  ]);

  const backgroundStyle = useAnimatedStyle(() => {
    const currentScale = scaleValue.value;
    const width = frameWidthValue.value * currentScale;
    const height = frameHeightValue.value * currentScale;
    return {
      transform: [
        { translateX: (boxWidth - width) / 2 },
        { translateY: (maxHeight - height) / 2 },
        { scaleX: width / BACKGROUND_SIZE },
        { scaleY: height / BACKGROUND_SIZE }
      ]
    };
  });

  const textPadding = geometry.padding;
  const textStyle = useAnimatedStyle(() => {
    const currentScale = scaleValue.value;
    const originX = (boxWidth - frameWidthValue.value * currentScale) / 2;
    const originY = (maxHeight - frameHeightValue.value * currentScale) / 2;
    return {
      transform: [
        { translateX: originX + textPadding * currentScale },
        { translateY: originY + textTopValue.value * currentScale },
        { scale: currentScale }
      ]
    };
  });

  function handleTextLayout(event: LayoutChangeEvent) {
    const { height } = event.nativeEvent.layout;
    const key = geometry.textCollage;
    setTextHeights((previous) =>
      previous[key] === height ? previous : { ...previous, [key]: height }
    );
  }

  return (
    <View
      style={[
        { height: maxHeight, width: boxWidth },
        !isReady && styles.hidden
      ]}
    >
      <Animated.View
        style={[
          styles.background,
          { backgroundColor: frameColor },
          backgroundStyle
        ]}
      />

      {geometry.slots.map((rect, slot) => (
        <AnimatedSlot
          key={slot}
          rect={rect}
          visible={slot < geometry.visibleSlots}
          filter={filter}
          flipped={flipPhotosHorizontally}
          frame={{
            width: frameWidthValue,
            height: frameHeightValue,
            scale: scaleValue,
            boxWidth,
            boxHeight: maxHeight
          }}
        />
      ))}

      <Animated.View style={[styles.text, textStyle]}>
        <Animated.View
          key={geometry.textCollage}
          entering={FadeIn.duration(250)}
          onLayout={handleTextLayout}
          style={{ width: geometry.frameWidth - geometry.padding * 2 }}
        >
          <PhotoBoothText collage={geometry.textCollage} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    height: BACKGROUND_SIZE,
    left: 0,
    position: "absolute",
    top: 0,
    transformOrigin: "top left",
    width: BACKGROUND_SIZE
  },
  hidden: {
    opacity: 0
  },
  text: {
    left: 0,
    position: "absolute",
    top: 0,
    transformOrigin: "top left"
  }
});
