import { createContext, useContext } from "react";

import type { SharedValue } from "react-native-reanimated";

type PanSnapContextValue = {
  activeIndex: number;
  count: number;
  itemCount: SharedValue<number>;
  layoutWidth: number;
  pageWidth: SharedValue<number>;
  translateX: SharedValue<number>;
};

export const PanSnapContext = createContext<PanSnapContextValue | null>(null);

export function usePanSnapContext(): PanSnapContextValue {
  const ctx = useContext(PanSnapContext);
  if (!ctx) {
    throw new Error("usePanSnapContext must be used within PanSnapGestureRoot");
  }
  return ctx;
}
