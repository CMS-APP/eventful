import {
  ColorMatrix,
  Cool,
  Kodachrome,
  Matrix,
  Polaroid,
  Sepia,
  Vintage,
  Warm
} from "react-native-color-matrix-image-filters";

import React from "react";

import { Image, StyleSheet, View } from "react-native";

interface FilterWrapperProps {
  filter: string;
  children: React.ReactNode;
  width?: number;
  height?: number;
  showGrain?: boolean;
}

export function FilterWrapper({
  filter,
  children,
  width,
  height,
  showGrain = false
}: FilterWrapperProps) {
  const enhancedGrayscaleMatrix = [
    0.35, 0.55, 0.1, 0, 0, 0.35, 0.55, 0.1, 0, 0, 0.35, 0.55, 0.1, 0, 0, 0, 0,
    0, 1, 0
  ];

  if (filter === "Normal") {
    return <>{children}</>;
  }

  const content = (
    <View
      style={
        width && height
          ? [styles.filterContainer, { width, height }]
          : undefined
      }
    >
      {children}
      {showGrain && width && height && (
        <Image
          source={require(`@/assets/textures/grain.png`)}
          style={[styles.grain, { width, height }]}
        />
      )}
    </View>
  );

  if (filter === "Black & White") {
    return (
      <ColorMatrix matrix={enhancedGrayscaleMatrix as unknown as Matrix}>
        {content}
      </ColorMatrix>
    );
  } else if (filter === "Sepia") {
    return <Sepia>{content}</Sepia>;
  } else if (filter === "Vintage") {
    return <Vintage>{content}</Vintage>;
  } else if (filter === "Warm") {
    return <Warm>{content}</Warm>;
  } else if (filter === "Cool") {
    return <Cool>{content}</Cool>;
  } else if (filter === "Kodachrome") {
    return <Kodachrome>{content}</Kodachrome>;
  } else if (filter === "Polaroid") {
    return <Polaroid>{content}</Polaroid>;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  filterContainer: {
    alignSelf: "center"
  },
  grain: {
    alignSelf: "center",
    opacity: 0.05,
    position: "absolute"
  }
});
