import { ColorMatrix } from "react-native-color-matrix-image-filters";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

import { useEffect, useMemo } from "react";

import { Image, StyleSheet } from "react-native";

import { matrixForFilter, needsGrainOverlay } from "../result/filterMatrix";
import { PHOTO_ASPECT, PREVIEW_TIMING, type Rect } from "./collageGeometry";

const SLOT_IMAGE_WIDTH = 240;
const SLOT_IMAGE_HEIGHT = SLOT_IMAGE_WIDTH / PHOTO_ASPECT;

const placeholderSource = require("@/assets/backgrounds/welcome-background.png");
const grainSource = require("@/assets/textures/grain.png");

export type FrameValues = {
  width: SharedValue<number>;
  height: SharedValue<number>;
  scale: SharedValue<number>;
  boxWidth: number;
  boxHeight: number;
};

type AnimatedSlotProps = {
  rect: Rect;
  visible: boolean;
  filter: string;
  flipped: boolean;
  frame: FrameValues;
};

export function AnimatedSlot({
  rect,
  visible,
  filter,
  flipped,
  frame
}: AnimatedSlotProps) {
  const x = useSharedValue(rect.x);
  const y = useSharedValue(rect.y);
  const width = useSharedValue(rect.width);
  const height = useSharedValue(rect.height);
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    x.value = withTiming(rect.x, PREVIEW_TIMING);
    y.value = withTiming(rect.y, PREVIEW_TIMING);
    width.value = withTiming(rect.width, PREVIEW_TIMING);
    height.value = withTiming(rect.height, PREVIEW_TIMING);
    opacity.value = withTiming(visible ? 1 : 0, PREVIEW_TIMING);
  }, [rect, visible, x, y, width, height, opacity]);

  const slotStyle = useAnimatedStyle(() => {
    const scale = frame.scale.value;
    const originX = (frame.boxWidth - frame.width.value * scale) / 2;
    const originY = (frame.boxHeight - frame.height.value * scale) / 2;
    return {
      opacity: opacity.value,
      transform: [
        { translateX: originX + x.value * scale },
        { translateY: originY + y.value * scale },
        { scaleX: (width.value * scale) / SLOT_IMAGE_WIDTH },
        { scaleY: (height.value * scale) / SLOT_IMAGE_HEIGHT }
      ]
    };
  });

  const imageStyle = useAnimatedStyle(() => {
    const scaleX = width.value / SLOT_IMAGE_WIDTH;
    const scaleY = height.value / SLOT_IMAGE_HEIGHT;
    const cover = Math.max(scaleX, scaleY);
    return {
      transform: [{ scaleX: cover / scaleX }, { scaleY: cover / scaleY }]
    };
  });

  const matrix = useMemo(() => matrixForFilter(filter), [filter]);

  return (
    <Animated.View style={[styles.slot, slotStyle]}>
      <Animated.View style={[styles.slotImageSize, imageStyle]}>
        <ColorMatrix key={filter} matrix={matrix} style={styles.slotImageSize}>
          <Image
            source={placeholderSource}
            style={[styles.slotImageSize, flipped && styles.flipped]}
          />
        </ColorMatrix>
        <Image
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          source={grainSource}
          style={[
            styles.grain,
            needsGrainOverlay(filter) ? styles.grainVisible : styles.grainHidden
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flipped: {
    transform: [{ scaleX: -1 }]
  },
  grain: {
    height: SLOT_IMAGE_HEIGHT,
    left: 0,
    position: "absolute",
    top: 0,
    width: SLOT_IMAGE_WIDTH
  },
  grainHidden: {
    opacity: 0
  },
  grainVisible: {
    opacity: 0.15
  },
  slot: {
    height: SLOT_IMAGE_HEIGHT,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    top: 0,
    transformOrigin: "top left",
    width: SLOT_IMAGE_WIDTH
  },
  slotImageSize: {
    height: SLOT_IMAGE_HEIGHT,
    width: SLOT_IMAGE_WIDTH
  }
});
