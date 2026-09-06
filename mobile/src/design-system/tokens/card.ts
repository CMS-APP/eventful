import { colors } from "./colors";
import { shadows } from "./shadows";

export const card = {
  small: {
    ...shadows.lightShadow,
    backgroundColor: colors.white,
    borderColor: colors.lightGray,
    borderRadius: 12,
    borderWidth: 0.5
  },
  medium: {
    ...shadows.lightShadow,
    backgroundColor: colors.white,
    borderColor: colors.lightGray,
    borderRadius: 20,
    borderWidth: 1
  }
};
