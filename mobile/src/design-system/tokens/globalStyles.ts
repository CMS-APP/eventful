import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Dimensions, StyleSheet } from "react-native";

import { colors } from "./colors";

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1
  },
  containerPrimary: {
    backgroundColor: colors.primary,
    flex: 1
  },
  divider: {
    backgroundColor: colors.gray,
    height: 1
  },
  largeWidget: {
    alignItems: "center",
    borderRadius: 24,
    padding: 20
  },
  mediumWidget: {
    alignItems: "center",
    borderRadius: 12,
    padding: 12
  },
  smallWidget: {
    alignItems: "center",
    borderRadius: 12,
    padding: 6
  }
});

// Custom hook for safe area styles
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

export const useAppDimensions = () => {
  const window = Dimensions.get("window");
  const screenWidth = window.width;
  const screenHeight = window.height;

  return { screenWidth, screenHeight };
};
