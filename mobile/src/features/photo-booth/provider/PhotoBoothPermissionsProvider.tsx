import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import { PermissionResponse, PermissionStatus } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

import { usePhotoBoothPermissions as useExpoPhotoBoothPermissions } from "@/hooks/usePhotoBoothPermissions";

import type { PhotoBoothPermissionsContextValue } from "./photoBoothProviderSlices";

const defaultCameraPermission = {
  status: PermissionStatus.UNDETERMINED,
  expires: "never",
  canAskAgain: true
} as PermissionResponse;

const defaultLibraryPermission = {
  status: MediaLibrary.PermissionStatus.UNDETERMINED,
  expires: "never",
  canAskAgain: true,
  accessPrivileges: "none"
} as MediaLibrary.PermissionResponse;

const PhotoBoothPermissionsContext =
  createContext<PhotoBoothPermissionsContextValue | null>(null);

export const usePhotoBoothPermissions = () => {
  const ctx = useContext(PhotoBoothPermissionsContext);
  if (ctx === null) {
    throw new Error(
      "usePhotoBoothPermissions must be used within PhotoBoothPermissionsProvider"
    );
  }
  return ctx;
};

export function PhotoBoothPermissionsProvider({
  children
}: {
  children: ReactNode;
}) {
  const permissions = useExpoPhotoBoothPermissions();

  const value: PhotoBoothPermissionsContextValue = {
    cameraPermission: permissions.cameraPermission ?? defaultCameraPermission,
    photoLibraryPermission:
      permissions.photoLibraryPermission ?? defaultLibraryPermission,
    checkPhotoBoothPermission: permissions.checkPhotoBoothPermission,
    photoBoothPermissionAlert: permissions.photoBoothPermissionAlert,
    requestCameraPermission: permissions.requestCameraPermission,
    requestPhotoLibraryPermission: permissions.requestPhotoLibraryPermission
  };

  return (
    <PhotoBoothPermissionsContext.Provider value={value}>
      {children}
    </PhotoBoothPermissionsContext.Provider>
  );
}
