import { useDispatch } from "react-redux";

import { useCallback, useEffect, useRef } from "react";

import { useLoading } from "@/providers/LoadingProvider";
import { appInit } from "@/services/initialisation/appInit";
import { AppError } from "@/utils/error";
import { navigationRef } from "@/utils/navigation";

export function useNavigationInitialization() {
  const dispatch = useDispatch();
  const hasInitialized = useRef(false);
  const { startLoading, updateProgress, stopLoading } = useLoading();

  const initialize = useCallback(async () => {
    if (!navigationRef.isReady() || hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    try {
      startLoading(6, "Initialising app...");

      const result = await appInit(dispatch, updateProgress);
      navigationRef.navigate(result);
    } catch (error) {
      new AppError(error, "Error initialising app", true);
      if (navigationRef.isReady()) {
        navigationRef.navigate("Auth" as never);
      }
    } finally {
      stopLoading();
    }
  }, [dispatch, startLoading, updateProgress, stopLoading]);

  useEffect(() => {
    if (navigationRef.isReady() && !hasInitialized.current) {
      initialize();
    }
  }, [initialize]);

  return { initialize };
}
