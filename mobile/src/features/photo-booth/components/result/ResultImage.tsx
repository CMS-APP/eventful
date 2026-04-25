import {
  ColorMatrix,
  type Matrix,
  cool,
  grayscale,
  kodachrome,
  normal,
  polaroid,
  sepia,
  vintage,
  warm
} from "react-native-color-matrix-image-filters";

import { memo, useMemo } from "react";

import { Image, Pressable, StyleSheet, View } from "react-native";

import { PhotoResult } from "expo-camera";

interface ResultImageProps {
  filter: string;
  photo: PhotoResult;
  width: number;
  height: number;
  flipped: boolean;
  preview: boolean;
  onPhotoPress: (index: number) => void;
  index: number;
}

const grainSource = require("@/assets/textures/grain.png");

function matrixForFilter(filter: string): Matrix {
  switch (filter) {
    case "Normal":
      return normal();
    case "Black & White":
      return grayscale(1);
    case "Sepia":
      return sepia(1);
    case "Vintage":
      return vintage();
    case "Warm":
      return warm();
    case "Cool":
      return cool();
    case "Kodachrome":
      return kodachrome();
    case "Polaroid":
      return polaroid();
    default:
      return normal();
  }
}

function needsGrainOverlay(filter: string): boolean {
  return (
    filter === "Black & White" || filter === "Vintage" || filter === "Polaroid"
  );
}

function ResultImageInner({
  filter = "Normal",
  photo,
  width,
  height,
  flipped,
  preview,
  onPhotoPress,
  index
}: ResultImageProps) {
  const matrix = useMemo(() => matrixForFilter(filter), [filter]);
  const showGrain = needsGrainOverlay(filter);

  const imageEl = useMemo(
    () => (
      <Image
        source={
          preview
            ? require("@/assets/backgrounds/welcome-background.png")
            : { uri: photo.uri }
        }
        style={[styles.image, { width, height }]}
      />
    ),
    [preview, photo.uri, width, height]
  );

  const inner = flipped ? (
    <View style={{ height, transform: [{ scaleX: -1 }], width }}>
      {imageEl}
    </View>
  ) : (
    imageEl
  );

  return (
    <Pressable onPress={() => onPhotoPress(index)}>
      <View style={[styles.wrap, { height, width }]}>
        <ColorMatrix
          key={`${filter}-${photo.uri}`}
          matrix={matrix}
          style={{ height, width }}
        >
          {inner}
        </ColorMatrix>
        <Image
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          source={grainSource}
          style={[
            styles.grain,
            { height, width },
            showGrain ? styles.grainVisible : styles.grainHidden
          ]}
        />
      </View>
    </Pressable>
  );
}

const ResultImage = memo(ResultImageInner);

export { ResultImage };

const styles = StyleSheet.create({
  grain: {
    left: 1,
    position: "absolute",
    top: -1
  },
  grainHidden: {
    opacity: 0
  },
  grainVisible: {
    opacity: 0.15
  },
  image: {
    alignSelf: "center"
  },
  wrap: {
    position: "relative"
  }
});
