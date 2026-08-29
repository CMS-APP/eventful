import { createContext, useContext } from "react";

import type { PhotoBoothConfig } from "@/types/PhotoBoothConfig";

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
  | "photoPromptsEnabled"
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
  | "setPhotoPromptsEnabled"
  | "isLoading"
>;

export const PhotoBoothSettingsContext =
  createContext<PhotoBoothSettingsValue | null>(null);

export function usePhotoBoothSettings(): PhotoBoothSettingsValue {
  const ctx = useContext(PhotoBoothSettingsContext);
  if (ctx === null) {
    throw new Error(
      "usePhotoBoothSettings must be used within PhotoBoothSettingsProvider"
    );
  }
  return ctx;
}
