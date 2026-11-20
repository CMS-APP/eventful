import { type ReactNode, type RefObject, useCallback, useState } from "react";

import { type LayoutChangeEvent, StyleSheet, View } from "react-native";

import { useAppDimensions } from "@/app/hooks/useAppDimensions";
import { colors } from "@/design-system/tokens/colors";

import { COLLAGE_BASE_WIDTH, type CollageSize } from "./collageScale";

type ScaledCollageProps = {
  children: ReactNode;
  captureRef?: RefObject<View | null>;
  horizontalPadding?: number;
  maxHeight?: number;
  onSizeChange?: (size: CollageSize) => void;
};

export function ScaledCollage({
  children,
  captureRef,
  horizontalPadding = 48,
  maxHeight,
  onSizeChange
}: ScaledCollageProps) {
  const { screenWidth } = useAppDimensions();
  const [size, setSize] = useState<CollageSize | null>(null);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      if (size && size.width === width && size.height === height) return;
      setSize({ width, height });
      onSizeChange?.({ width, height });
    },
    [size, onSizeChange]
  );

  const availableWidth = screenWidth - horizontalPadding;
  const scale = size
    ? Math.min(
        screenWidth / COLLAGE_BASE_WIDTH,
        availableWidth / size.width,
        maxHeight ? maxHeight / size.height : Infinity
      )
    : 1;

  return (
    <View
      style={[
        styles.container,
        size && { height: size.height * scale, width: size.width * scale },
        !size && styles.hidden
      ]}
    >
      <View
        ref={captureRef}
        collapsable={false}
        onLayout={handleLayout}
        style={[styles.collage, { transform: [{ scale }] }]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collage: {
    left: 0,
    position: "absolute",
    top: 0,
    transformOrigin: "top left"
  },
  container: {
    alignSelf: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6
  },
  hidden: {
    opacity: 0
  }
});
