import { useEffect, useRef } from "react";

import { AppState } from "react-native";

import * as Device from "expo-device";

import { BASE_URL, checkBackendConnection } from "@/services/firebase/backend";

export function useDevBackendCheck() {
  const lastConnected = useRef<boolean | null>(null);

  useEffect(() => {
    if (!__DEV__) return;

    async function check() {
      const connected = await checkBackendConnection();
      if (connected === lastConnected.current) return;
      lastConnected.current = connected;

      const device = Device.deviceName ?? Device.modelName ?? "Unknown device";
      console.log(
        `[Dev backend] ${device}: ${connected ? "connected" : "NOT connected"} to ${BASE_URL}`
      );
    }

    check();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });

    return () => subscription.remove();
  }, []);
}
