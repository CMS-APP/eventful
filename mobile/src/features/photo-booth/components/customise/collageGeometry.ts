import { Easing } from "react-native-reanimated";

import { COLLAGE_BASE_WIDTH } from "../result/collageScale";

export type Rect = { x: number; y: number; width: number; height: number };

export type TextCollage = "column" | "grid" | "row" | "single";

export type CollageGeometry = {
  frameWidth: number;
  padding: number;
  slots: Rect[];
  visibleSlots: number;
  textTop: number;
  textCollage: TextCollage;
};

export const PHOTO_ASPECT = 7 / 10;
export const PREVIEW_TIMING = {
  duration: 380,
  easing: Easing.inOut(Easing.cubic)
};

const SLOT_COUNT = 4;

function buildGeometry(
  frameWidth: number,
  padding: number,
  visible: Rect[],
  textTop: number,
  textCollage: TextCollage
): CollageGeometry {
  const slots = Array.from(
    { length: SLOT_COUNT },
    (_, slot) => visible[Math.min(slot, visible.length - 1)]
  );
  return {
    frameWidth,
    padding,
    slots,
    visibleSlots: visible.length,
    textTop,
    textCollage
  };
}

export function getCollageGeometry(collageStyle: string): CollageGeometry {
  const base = COLLAGE_BASE_WIDTH;

  if (collageStyle === "row") {
    const padding = 12;
    const gap = 12;
    const frameWidth = base - 48 - gap * 2;
    const width = (frameWidth - gap) / 3 - gap;
    const height = width / PHOTO_ASPECT;
    const startX =
      padding + (frameWidth - padding * 2 - (width * 3 + gap * 2)) / 2;
    const visible = [0, 1, 2].map((slot) => ({
      x: startX + slot * (width + gap),
      y: padding,
      width,
      height
    }));
    return buildGeometry(frameWidth, padding, visible, padding + height, "row");
  }

  if (collageStyle === "column") {
    const padding = 6;
    const gap = 6;
    const width = (base - 24) / 4;
    const height = width / PHOTO_ASPECT;
    const frameWidth = width + 12;
    const visible = [0, 1, 2].map((slot) => ({
      x: (frameWidth - width) / 2,
      y: padding + slot * (height + gap),
      width,
      height
    }));
    return buildGeometry(
      frameWidth,
      padding,
      visible,
      padding + height * 3 + gap * 3,
      "column"
    );
  }

  if (collageStyle === "square") {
    const padding = 12;
    const gap = 12;
    const frameWidth = base / 1.5 - gap;
    const width = (frameWidth - gap) / 2 - gap;
    const height = width / PHOTO_ASPECT;
    const startX = padding + (frameWidth - padding * 2 - (width * 2 + gap)) / 2;
    const visible = [0, 1, 2, 3].map((slot) => ({
      x: startX + (slot % 2) * (width + gap),
      y: padding + Math.floor(slot / 2) * (height + gap),
      width,
      height
    }));
    return buildGeometry(
      frameWidth,
      padding,
      visible,
      padding + height * 2 + gap,
      "grid"
    );
  }

  const padding = 12;
  const frameWidth = base / 1.5 - padding;
  const size = frameWidth - padding * 2;
  return buildGeometry(
    frameWidth,
    padding,
    [{ x: padding, y: padding, width: size, height: size }],
    padding + size,
    "single"
  );
}
