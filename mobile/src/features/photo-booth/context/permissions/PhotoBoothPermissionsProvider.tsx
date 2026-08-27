import type { ReactNode } from "react";
import { useCallback } from "react";

import { Alert, Linking } from "react-native";

import { PermissionResponse, PermissionStatus, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

import { PhotoBoothPermissionsContext } from "@/features/photo-booth/context/permissions/PhotoBoothPermissionsContext";
import type { PhotoBoothPermissionsContextValue } from "@/features/photo-booth/context/permissions/PhotoBoothPermissionsContext";

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

export function PhotoBoothPermissionsProvider({
  children
}: {
  children: ReactNode;
}) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [photoLibraryPermission, requestPhotoLibraryPermission] =
    MediaLibrary.usePermissions();

  const checkPhotoBoothPermission = useCallback(() => {
    if (!cameraPermission || !photoLibraryPermission) {
      return false;
    }

    if (
      cameraPermission.status === PermissionStatus.GRANTED &&
      photoLibraryPermission.status === PermissionStatus.GRANTED
    ) {
      if (photoLibraryPermission.accessPrivileges !== "all") {
        return false;
      }
      return true;
    }
    return false;
  }, [cameraPermission, photoLibraryPermission]);

  const photoBoothPermissionAlert = useCallback(() => {
    Alert.alert(
      "Photo Booth Permissions",
      "We need your permission to use your camera and photo library",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Go to Settings",
          onPress: () => Linking.openSettings()
        }
      ]
    );
  }, []);

  const ensurePermissions = useCallback(async () => {
    if (checkPhotoBoothPermission()) {
      return true;
    }

    if ((cameraPermission ?? defaultCameraPermission).canAskAgain) {
      await requestCameraPermission();
    }

    if ((photoLibraryPermission ?? defaultLibraryPermission).canAskAgain) {
      await requestPhotoLibraryPermission();
    }

    if (checkPhotoBoothPermission()) {
      return true;
    }

    photoBoothPermissionAlert();
    return false;
  }, [
    cameraPermission,
    photoLibraryPermission,
    checkPhotoBoothPermission,
    requestCameraPermission,
    requestPhotoLibraryPermission,
    photoBoothPermissionAlert
  ]);

  const value: PhotoBoothPermissionsContextValue = {
    cameraPermission: cameraPermission ?? defaultCameraPermission,
    photoLibraryPermission: photoLibraryPermission ?? defaultLibraryPermission,
    checkPhotoBoothPermission,
    photoBoothPermissionAlert,
    requestCameraPermission,
    requestPhotoLibraryPermission,
    ensurePermissions
  };

  return (
    <PhotoBoothPermissionsContext.Provider value={value}>
      {children}
    </PhotoBoothPermissionsContext.Provider>
  );
}
