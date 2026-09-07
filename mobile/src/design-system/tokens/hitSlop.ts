import { Insets } from "react-native";

type HitSlopSize = "xSmall" | "small" | "medium" | "large";

const hitSlopMap: Record<HitSlopSize, Insets> = {
  xSmall: { top: 4, right: 4, bottom: 4, left: 4 },
  small: { top: 8, right: 8, bottom: 8, left: 8 },
  medium: { top: 12, right: 12, bottom: 12, left: 12 },
  large: { top: 16, right: 16, bottom: 16, left: 16 }
};

export function getHitSlop(size: HitSlopSize = "medium"): Insets {
  return hitSlopMap[size];
}
