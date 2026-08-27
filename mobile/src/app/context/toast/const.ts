import { colors } from "@/design-system/tokens/colors";

export type ToastType = "success" | "warning" | "error";

export const toastColors: Record<ToastType, string> = {
  success: colors.green,
  warning: colors.secondary,
  error: colors.red
};

export const toastIcons: Record<ToastType, string> = {
  success: "check",
  warning: "triangle-exclamation",
  error: "circle-exclamation"
};
