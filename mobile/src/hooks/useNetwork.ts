import NetInfo from "@react-native-community/netinfo";

import { useCallback, useEffect, useState } from "react";

import { Alert } from "react-native";

import * as Updates from "expo-updates";

import { AppError } from "@/utils/error";

function getInternetReachable(
  isInternetReachable: boolean | null,
  isConnected: boolean | null
): boolean {
  return isInternetReachable ?? (isConnected ? true : false);
}

export function useNetwork() {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasShownOfflineAlert, setHasShownOfflineAlert] = useState(false);

  const reloadApp = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      new AppError(error, "useNetwork: Error reloading app");
    }
  }, []);

  const updateNetworkState = useCallback(
    (state: Awaited<ReturnType<typeof NetInfo.fetch>>) => {
      const connected = state.isConnected ?? false;
      const internetReachable = getInternetReachable(
        state.isInternetReachable,
        state.isConnected
      );

      setIsConnected(connected);
      setIsInternetReachable(internetReachable);

      if (connected && internetReachable) {
        setHasShownOfflineAlert(false);
      }
    },
    []
  );

  useEffect(() => {
    const initializeNetworkState = async () => {
      try {
        const state = await NetInfo.fetch();
        updateNetworkState(state);
        setIsInitialized(true);
      } catch (error) {
        new AppError(error, "useNetwork: Error checking initial network state");
        setIsInitialized(true);
      }
    };

    initializeNetworkState();

    const unsubscribe = NetInfo.addEventListener(updateNetworkState);

    return () => unsubscribe();
  }, [updateNetworkState]);

  useEffect(() => {
    if (!isInternetReachable && !hasShownOfflineAlert && isInitialized) {
      setHasShownOfflineAlert(true);
      Alert.alert(
        "No Internet Connection",
        "Please check your internet connection and restart the app.",
        [
          {
            text: "Restart App",
            onPress: reloadApp,
            style: "default"
          }
        ]
      );
    }
  }, [isInternetReachable, hasShownOfflineAlert, isInitialized, reloadApp]);

  return { isConnected, isInternetReachable };
}
