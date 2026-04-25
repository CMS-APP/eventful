import { useEffect } from "react";

import { BackHandler, Platform } from "react-native";

/**
 * Hook to disable the Android back button.
 * Prevents default back button behavior throughout the app.
 */
export function useBackButtonHandler() {
  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Return true to prevent default back behavior
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);
}
