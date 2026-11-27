import { useCallback, useEffect, useRef } from "react";

import { BackHandler, Platform } from "react-native";

import { useFocusEffect } from "@react-navigation/native";

export function useBackButtonAction(onBack: () => void, enabled = true) {
  const onBackRef = useRef(onBack);

  useEffect(() => {
    onBackRef.current = onBack;
  }, [onBack]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android" || !enabled) return;

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          onBackRef.current();
          return true;
        }
      );

      return () => subscription.remove();
    }, [enabled])
  );
}
