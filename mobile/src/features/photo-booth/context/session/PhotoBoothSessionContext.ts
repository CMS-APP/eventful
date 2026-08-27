import { createContext, useContext } from "react";

import type { PhotoBoothConfig } from "@/types/PhotoBoothConfig";

export type PhotoBoothSessionContextValue = Pick<
  PhotoBoothConfig,
  | "photos"
  | "photoBoothPage"
  | "locked"
  | "lockPin"
  | "setPhotos"
  | "setPhotoBoothPage"
  | "setLocked"
  | "setLockPin"
> & {
  isBoothRunning: boolean;
  setIsBoothRunning: (running: boolean) => void;
};

export const PhotoBoothSessionContext =
  createContext<PhotoBoothSessionContextValue | null>(null);

export function usePhotoBoothSession(): PhotoBoothSessionContextValue {
  const ctx = useContext(PhotoBoothSessionContext);
  if (ctx === null) {
    throw new Error(
      "usePhotoBoothSession must be used within PhotoBoothSessionProvider"
    );
  }
  return ctx;
}
