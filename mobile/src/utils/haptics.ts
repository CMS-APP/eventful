import * as Haptics from "expo-haptics";

export const haptics = {
  soft: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  },
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};
