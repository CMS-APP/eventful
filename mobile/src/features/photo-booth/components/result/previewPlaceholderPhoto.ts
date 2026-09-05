import type { PhotoResult } from "expo-camera";

export function previewPlaceholderPhoto(slot: number): PhotoResult {
  return {
    uri: `eventful-preview-slot-${slot}`,
    width: 1080,
    height: 1920
  };
}
