import { createContext, useContext } from "react";

import type { PhotoBoothConfig } from "@/types/PhotoBoothConfig";

export type PhotoBoothPermissionsContextValue = Pick<
  PhotoBoothConfig,
  | "cameraPermission"
  | "photoLibraryPermission"
  | "checkPhotoBoothPermission"
  | "photoBoothPermissionAlert"
  | "requestCameraPermission"
  | "requestPhotoLibraryPermission"
> & {
  ensurePermissions: () => Promise<boolean>;
};

export const PhotoBoothPermissionsContext =
  createContext<PhotoBoothPermissionsContextValue | null>(null);

export function usePhotoBoothPermissions(): PhotoBoothPermissionsContextValue {
  const ctx = useContext(PhotoBoothPermissionsContext);
  if (ctx === null) {
    throw new Error(
      "usePhotoBoothPermissions must be used within PhotoBoothPermissionsProvider"
    );
  }
  return ctx;
}
