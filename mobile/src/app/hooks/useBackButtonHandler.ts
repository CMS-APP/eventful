import { useEffect } from "react";

import { BackHandler, Platform } from "react-native";

export function useBackButtonHandler() {
  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);
}
