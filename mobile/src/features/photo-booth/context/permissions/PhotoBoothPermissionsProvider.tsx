import type { ReactNode } from "react";
import { useCallback } from "react";

import { Alert, Linking } from "react-native";

import {
  PermissionResponse,
  PermissionStatus,
  useCameraPermissions
} from "expo-camera";
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

function isPhotoBoothPermissionGranted(
  camera: PermissionResponse,
  library: MediaLibrary.PermissionResponse
) {
  if (
    camera.status !== PermissionStatus.GRANTED ||
    library.status !== PermissionStatus.GRANTED
  ) {
    return false;
  }
  return library.accessPrivileges === "all";
}

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
    return isPhotoBoothPermissionGranted(
      cameraPermission,
      photoLibraryPermission
    );
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

    let latestCameraPermission = cameraPermission ?? defaultCameraPermission;
    let latestLibraryPermission =
      photoLibraryPermission ?? defaultLibraryPermission;

    if (latestCameraPermission.canAskAgain) {
      latestCameraPermission = await requestCameraPermission();
    }

    if (latestLibraryPermission.canAskAgain) {
      latestLibraryPermission = await requestPhotoLibraryPermission();
    }

    if (
      isPhotoBoothPermissionGranted(
        latestCameraPermission,
        latestLibraryPermission
      )
    ) {
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
