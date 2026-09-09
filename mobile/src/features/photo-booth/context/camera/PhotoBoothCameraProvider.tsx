import { type ReactNode, useCallback, useMemo, useState } from "react";

import { Platform } from "react-native";

import { AvailableLenses, PhotoResult } from "expo-camera";

import type { PhotoBoothCameraContextValue } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
import { PhotoBoothCameraContext } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

export function PhotoBoothCameraProvider({
  children
}: {
  children: ReactNode;
}) {
  const { flash, setFlash } = usePhotoBoothSettings();

  const [facing, setFacing] = useState<"front" | "back">("front");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [photos, setPhotos] = useState<PhotoResult[]>([]);
  const [ultraWideLens, setUltraWideLens] = useState<string | undefined>(
    undefined
  );
  const [isUltraWideActive, setIsUltraWideActive] = useState(false);

  const toggleCamera = useCallback(() => {
    setIsCameraReady(false);
    setIsUltraWideActive(false);
    setFacing((prev) => (prev === "front" ? "back" : "front"));
  }, []);

  const toggleFlash = useCallback(() => {
    setFlash(!flash);
  }, [flash, setFlash]);

  const setIsCameraReadyStable = useCallback((ready: boolean) => {
    setIsCameraReady(ready);
  }, []);

  const toggleUltraWide = useCallback(() => {
    setIsUltraWideActive((prev) => !prev);
  }, []);

  const onAvailableLensesChanged = useCallback(
    ({ lenses }: AvailableLenses) => {
      setUltraWideLens(
        lenses.find((lens) => lens.toLowerCase().includes("ultra wide"))
      );
    },
    []
  );

  const isUltraWideAvailable =
    Platform.OS === "ios" && facing === "back" && !!ultraWideLens;
  const isUltraWideActiveResolved = isUltraWideAvailable && isUltraWideActive;
  const selectedLens = isUltraWideActiveResolved ? ultraWideLens : undefined;

  const value = useMemo<PhotoBoothCameraContextValue>(
    () => ({
      facing,
      toggleCamera,
      isCameraReady,
      setIsCameraReady: setIsCameraReadyStable,
      flash,
      toggleFlash,
      photos,
      setPhotos,
      selectedLens,
      isUltraWideAvailable,
      isUltraWideActive: isUltraWideActiveResolved,
      toggleUltraWide,
      onAvailableLensesChanged
    }),
    [
      facing,
      toggleCamera,
      isCameraReady,
      setIsCameraReadyStable,
      flash,
      toggleFlash,
      photos,
      selectedLens,
      isUltraWideAvailable,
      isUltraWideActiveResolved,
      toggleUltraWide,
      onAvailableLensesChanged
    ]
  );

  return (
    <PhotoBoothCameraContext.Provider value={value}>
      {children}
    </PhotoBoothCameraContext.Provider>
  );
}
