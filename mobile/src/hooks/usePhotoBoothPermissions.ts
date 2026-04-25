import { useCallback } from "react";

import { Alert, Linking } from "react-native";

import { PermissionStatus, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

export function usePhotoBoothPermissions() {
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

  return {
    cameraPermission,
    photoLibraryPermission,
    checkPhotoBoothPermission,
    photoBoothPermissionAlert,
    requestCameraPermission,
    requestPhotoLibraryPermission
  };
}
