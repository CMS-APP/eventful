import type { PermissionResponse } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

type PermissionRequest = () => Promise<unknown> | unknown;

interface EnsurePhotoBoothPermissionsArgs {
  cameraPermission: PermissionResponse;
  photoLibraryPermission: MediaLibrary.PermissionResponse;
  checkPhotoBoothPermission: () => boolean;
  requestCameraPermission: PermissionRequest;
  requestPhotoLibraryPermission: PermissionRequest;
  photoBoothPermissionAlert: () => void;
}

export async function ensurePhotoBoothPermissions({
  cameraPermission,
  photoLibraryPermission,
  checkPhotoBoothPermission,
  requestCameraPermission,
  requestPhotoLibraryPermission,
  photoBoothPermissionAlert
}: EnsurePhotoBoothPermissionsArgs) {
  if (checkPhotoBoothPermission()) {
    return true;
  }

  if (cameraPermission.canAskAgain) {
    await Promise.resolve(requestCameraPermission());
  }

  if (photoLibraryPermission.canAskAgain) {
    await Promise.resolve(requestPhotoLibraryPermission());
  }

  if (checkPhotoBoothPermission()) {
    return true;
  }

  photoBoothPermissionAlert();
  return false;
}
