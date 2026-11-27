import {
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

export function matrixForFilter(filter: string): Matrix {
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

export function needsGrainOverlay(filter: string): boolean {
  return (
    filter === "Black & White" || filter === "Vintage" || filter === "Polaroid"
  );
}
