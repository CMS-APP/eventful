import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";

import { PhotoResult } from "expo-camera";

export type PhotoBoothCameraContextValue = {
  facing: "front" | "back";
  toggleCamera: () => void;
  isCameraReady: boolean;
  setIsCameraReady: (ready: boolean) => void;
  flash: boolean;
  toggleFlash: () => void;
  photos: PhotoResult[];
  setPhotos: Dispatch<SetStateAction<PhotoResult[]>>;
};

export const PhotoBoothCameraContext =
  createContext<PhotoBoothCameraContextValue | null>(null);

export function usePhotoBoothCamera(): PhotoBoothCameraContextValue {
  const ctx = useContext(PhotoBoothCameraContext);
  if (ctx === null) {
    throw new Error(
      "usePhotoBoothCamera must be used within PhotoBoothCameraProvider"
    );
  }
  return ctx;
}
