import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StyleSheet } from "react-native";

export const useSafeAreaStyles = () => {
  const insets = useSafeAreaInsets();

  return StyleSheet.create({
    safeArea: {
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingTop: insets.top
    }
  });
};
