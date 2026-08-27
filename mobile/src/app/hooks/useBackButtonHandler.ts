import { useEffect } from "react";

import { BackHandler, Platform } from "react-native";

import { navigationRef } from "@/app/navigation";

export function useBackButtonHandler() {
  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (navigationRef.isReady() && navigationRef.canGoBack()) {
          return false;
        }
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);
}
