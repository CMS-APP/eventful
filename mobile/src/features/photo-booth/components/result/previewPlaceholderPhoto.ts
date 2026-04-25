import type { PhotoResult } from "expo-camera";

/** Synthetic photo so collages can render slots; `ResultImage` ignores `uri` when `preview` is true. */
export function previewPlaceholderPhoto(slot: number): PhotoResult {
  return {
    uri: `eventful-preview-slot-${slot}`,
    width: 1080,
    height: 1920
  };
}
