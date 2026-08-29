import React from "react";

import { PermissionResponse, PhotoResult } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

export interface PhotoBoothConfig {
  cameraPermission: PermissionResponse;
  photoLibraryPermission: MediaLibrary.PermissionResponse;
  checkPhotoBoothPermission: () => boolean;
  photoBoothPermissionAlert: () => void;
  photos: PhotoResult[];
  photoBoothPage: string;
  title: string;
  subTitle: string;
  locked: boolean;
  lockPin: string;
  frameColor: string;
  textColor: string;
  customTitleFont: string;
  customTitleFontSize: number;
  customSubTitleFont: string;
  customSubTitleFontSize: number;
  isLoading: boolean;
  autoSave: boolean;
  saveIndividualPhotos: boolean;
  removeWatermark: boolean;
  flipPhotosHorizontally: boolean;
  collageStyle: string;
  canChangeCollage: boolean;
  canChangeFilter: boolean;
  flash: boolean;
  filter: string;
  timerDuration: number;
  photoPromptsEnabled: boolean;
  requestCameraPermission: () => void;
  requestPhotoLibraryPermission: () => void;
  setPhotos: React.Dispatch<React.SetStateAction<PhotoResult[]>>;
  setPhotoBoothPage: (page: string) => void;
  setTitle: (title: string) => void;
  setSubTitle: (subTitle: string) => void;
  setLocked: (locked: boolean) => void;
  setLockPin: (lockPin: string) => void;
  setFrameColor: (frameColor: string) => void;
  setTextColor: (textColor: string) => void;
  setCustomTitleFont: (customTitleFont: string) => void;
  setCustomTitleFontSize: (customTitleFontSize: number) => void;
  setCustomSubTitleFont: (customSubTitleFont: string) => void;
  setCustomSubTitleFontSize: (customSubTitleFontSize: number) => void;
  setAutoSave: (autoSave: boolean) => void;
  setSaveIndividualPhotos: (saveIndividualPhotos: boolean) => void;
  setRemoveWatermark: (removeWatermark: boolean) => void;
  setFlipPhotosHorizontally: (flipPhotosHorizontally: boolean) => void;
  setCollageStyle: (collageStyle: string) => void;
  setCanChangeCollage: (canChangeCollage: boolean) => void;
  setCanChangeFilter: (canChangeFilter: boolean) => void;
  setFlash: (flash: boolean) => void;
  setFilter: (filter: string) => void;
  setTimerDuration: (timerDuration: number) => void;
  setPhotoPromptsEnabled: (photoPromptsEnabled: boolean) => void;
}

export const PB_CONFIG = {
  title: "",
  subTitle: "",
  frameColor: "#FFFFFF",
  textColor: "#000000",
  customTitleFont: "Poppins",
  customTitleFontSize: 24,
  customSubTitleFont: "Poppins",
  customSubTitleFontSize: 24,
  autoSave: true,
  saveIndividualPhotos: false,
  removeWatermark: false,
  flipPhotosHorizontally: true,
  collageStyle: "square",
  canChangeCollage: false,
  canChangeFilter: false,
  flash: false,
  filter: "Normal",
  timerDuration: 4,
  photoPromptsEnabled: false
};
