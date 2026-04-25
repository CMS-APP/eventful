import { useCallback } from "react";
import { StatusBar } from "react-native";

import { useFocusEffect } from "@react-navigation/native";

export function useScreenStatusBar(light = true) {
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(light ? "light-content" : "dark-content");
    }, [light])
  );
}
