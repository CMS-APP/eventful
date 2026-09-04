import { useEffect, useRef } from "react";

import { AppState, AppStateStatus, Platform } from "react-native";

import { syncNextEventWidget } from "@/services/widget/nextEventWidget";

export function useSyncEventWidget(userId: string | null | undefined) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (Platform.OS !== "ios" || !userId || userId === "null") return;

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
