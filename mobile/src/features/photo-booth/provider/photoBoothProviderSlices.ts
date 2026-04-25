import type { Dispatch, SetStateAction } from "react";

import { PhotoResult } from "expo-camera";

import type { PhotoBoothConfig } from "@/types/PhotoBoothConfig";

/** Live camera UI: facing, readiness, flash (flash value + toggle from settings). */
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

/** Ephemeral booth flow: shots, navigation step, lock UI, capture-session flag for navigator. */
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

/** Camera / library permission state and helpers. */
export type PhotoBoothPermissionsContextValue = Pick<
  PhotoBoothConfig,
  | "cameraPermission"
  | "photoLibraryPermission"
  | "checkPhotoBoothPermission"
  | "photoBoothPermissionAlert"
  | "requestCameraPermission"
  | "requestPhotoLibraryPermission"
>;

/** Persisted settings + loading + setters from `usePhotoBoothConfig`. */
export type PhotoBoothSettingsValue = Pick<
  PhotoBoothConfig,
  | "title"
  | "subTitle"
  | "frameColor"
  | "textColor"
  | "customTitleFont"
  | "customTitleFontSize"
  | "customSubTitleFont"
  | "customSubTitleFontSize"
  | "autoSave"
  | "saveIndividualPhotos"
  | "removeWatermark"
  | "flipPhotosHorizontally"
  | "collageStyle"
  | "canChangeCollage"
  | "canChangeFilter"
  | "flash"
  | "filter"
  | "timerDuration"
  | "setTitle"
  | "setSubTitle"
  | "setFrameColor"
  | "setTextColor"
  | "setCustomTitleFont"
  | "setCustomTitleFontSize"
  | "setCustomSubTitleFont"
  | "setCustomSubTitleFontSize"
  | "setAutoSave"
  | "setSaveIndividualPhotos"
  | "setRemoveWatermark"
  | "setFlipPhotosHorizontally"
  | "setCollageStyle"
  | "setCanChangeCollage"
  | "setCanChangeFilter"
  | "setFlash"
  | "setFilter"
  | "setTimerDuration"
  | "isLoading"
>;
