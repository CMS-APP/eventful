import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import { usePhotoBoothConfig } from "@/hooks/usePhotoBoothConfig";

import type { PhotoBoothSettingsValue } from "./photoBoothProviderSlices";

const PhotoBoothSettingsContext = createContext<PhotoBoothSettingsValue | null>(
  null
);

export const usePhotoBoothSettings = () => {
  const ctx = useContext(PhotoBoothSettingsContext);
  if (ctx === null) {
    throw new Error(
      "usePhotoBoothSettings must be used within PhotoBoothSettingsProvider"
    );
  }
  return ctx;
};

export function PhotoBoothSettingsProvider({
  children
}: {
  children: ReactNode;
}) {
  const {
    config,
    isLoading,
    setTitle,
    setSubTitle,
    setFrameColor,
    setTextColor,
    setCustomTitleFont,
    setCustomTitleFontSize,
    setCustomSubTitleFont,
    setCustomSubTitleFontSize,
    setAutoSave,
    setSaveIndividualPhotos,
    setRemoveWatermark,
    setFlipPhotosHorizontally,
    setCollageStyle,
    setCanChangeCollage,
    setCanChangeFilter,
    setFlash,
    setFilter,
    setTimerDuration
  } = usePhotoBoothConfig();

  const value: PhotoBoothSettingsValue = {
    ...config,
    isLoading,
    setTitle,
    setSubTitle,
    setFrameColor,
    setTextColor,
    setCustomTitleFont,
    setCustomTitleFontSize,
    setCustomSubTitleFont,
    setCustomSubTitleFontSize,
    setAutoSave,
    setSaveIndividualPhotos,
    setRemoveWatermark,
    setFlipPhotosHorizontally,
    setCollageStyle,
    setCanChangeCollage,
    setCanChangeFilter,
    setFlash,
    setFilter,
    setTimerDuration
  };

  return (
    <PhotoBoothSettingsContext.Provider value={value}>
      {children}
    </PhotoBoothSettingsContext.Provider>
  );
}
