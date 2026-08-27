import {
  type ReactNode,
  useCallback,
  useMemo,
  useState
} from "react";

import { PhotoResult } from "expo-camera";

import { PhotoBoothCameraContext } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
import type { PhotoBoothCameraContextValue } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
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
