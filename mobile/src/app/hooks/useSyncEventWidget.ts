import { useEffect, useRef } from "react";

import { AppState, AppStateStatus, Platform } from "react-native";

import { syncNextEventWidget } from "@/services/widget/nextEventWidget";
import { isValidUserId } from "@/utils/userId";

export function useSyncEventWidget(userId: string | null | undefined) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (Platform.OS !== "ios" || !isValidUserId(userId)) return;

    syncNextEventWidget();

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        const wasActive = appState.current === "active";
        const isActive = nextAppState === "active";

        if (wasActive !== isActive) {
          syncNextEventWidget();
        }
        appState.current = nextAppState;
      }
    );

    return () => subscription.remove();
  }, [userId]);
}
