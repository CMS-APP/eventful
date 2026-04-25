import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";

import { PhotoResult } from "expo-camera";

import { usePhotoBoothSettings } from "./PhotoBoothSettingsProvider";
import type { PhotoBoothCameraContextValue } from "./photoBoothProviderSlices";

const PhotoBoothCameraContext =
  createContext<PhotoBoothCameraContextValue | null>(null);

export const usePhotoBoothCamera = () => {
  const ctx = useContext(PhotoBoothCameraContext);
  if (ctx === null) {
    throw new Error(
      "usePhotoBoothCamera must be used within PhotoBoothCameraProvider"
    );
  }
  return ctx;
};

export function PhotoBoothCameraProvider({
  children
}: {
  children: ReactNode;
}) {
  const { flash, setFlash } = usePhotoBoothSettings();

  const [facing, setFacing] = useState<"front" | "back">("front");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [photos, setPhotos] = useState<PhotoResult[]>([]);

  const toggleCamera = useCallback(() => {
    setIsCameraReady(false);
    setFacing((prev) => (prev === "front" ? "back" : "front"));
  }, []);

  const toggleFlash = useCallback(() => {
    setFlash(!flash);
  }, [flash, setFlash]);

  const setIsCameraReadyStable = useCallback((ready: boolean) => {
    setIsCameraReady(ready);
  }, []);

  const value = useMemo<PhotoBoothCameraContextValue>(
    () => ({
      facing,
      toggleCamera,
      isCameraReady,
      setIsCameraReady: setIsCameraReadyStable,
      flash,
      toggleFlash,
      photos,
      setPhotos
    }),
    [
      facing,
      toggleCamera,
      isCameraReady,
      setIsCameraReadyStable,
      flash,
      toggleFlash,
      photos,
      setPhotos
    ]
  );

  return (
    <PhotoBoothCameraContext.Provider value={value}>
      {children}
    </PhotoBoothCameraContext.Provider>
  );
}
