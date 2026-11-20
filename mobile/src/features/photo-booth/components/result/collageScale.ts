import type { CaptureOptions } from "react-native-view-shot";

import { PixelRatio, Platform } from "react-native";

export const COLLAGE_BASE_WIDTH = 393;

export const COLLAGE_OUTPUT_SCALE = 3;

export type CollageSize = { width: number; height: number };

export function getCollageCaptureOptions(
  size: CollageSize | null
): CaptureOptions {
  const options: CaptureOptions = { format: "png", quality: 0.8 };

  if (!size) return options;

  const devicePixelRatio = Platform.OS === "ios" ? PixelRatio.get() : 1;

  return {
    ...options,
    width: Math.round(size.width * COLLAGE_OUTPUT_SCALE) / devicePixelRatio,
    height: Math.round(size.height * COLLAGE_OUTPUT_SCALE) / devicePixelRatio
  };
}
