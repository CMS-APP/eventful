import { useEffect } from "react";

import { AppState } from "react-native";

import { handleAppStateChange } from "@/utils/appState";

/**
 * Hook to handle app state changes (active, background, inactive).
 * Clears notifications when app becomes active.
 */
export function useAppStateHandler() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);
}

