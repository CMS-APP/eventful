import { useSelector } from "react-redux";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { PhotoBoothSettingsContext } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";
import type { PhotoBoothSettingsValue } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";
import {
  getPhotoBoothConfig,
  savePhotoBoothConfig
} from "@/services/firebase/firebaseUserFunctions";
import { UserState } from "@/store/UserSlice";
import { PB_CONFIG, PhotoBoothConfig } from "@/types/PhotoBoothConfig";
import { showErrorNotification } from "@/utils/appNotifications";
import { log } from "@/utils/logging";

type ConfigState = {
  title: string;
  subTitle: string;
  frameColor: string;
  textColor: string;
  customTitleFont: string;
  customTitleFontSize: number;
  customSubTitleFont: string;
  customSubTitleFontSize: number;
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
};

/** Map legacy/renamed font names to current font keys (e.g. Chloe or Tribune Bold → Gotham Bold) */
const normalizeFontKey = (font: string): string => {
  if (font === "Chloe" || font === "Tribune Bold") return "Gotham Bold";
  return font;
};

const getDefaultConfig = (): ConfigState => ({
  title: PB_CONFIG.title,
  subTitle: PB_CONFIG.subTitle,
  frameColor: PB_CONFIG.frameColor,
  textColor: PB_CONFIG.textColor,
  customTitleFont: PB_CONFIG.customTitleFont,
  customTitleFontSize: PB_CONFIG.customTitleFontSize,
  customSubTitleFont: PB_CONFIG.customSubTitleFont,
  customSubTitleFontSize: PB_CONFIG.customSubTitleFontSize,
  autoSave: PB_CONFIG.autoSave,
  saveIndividualPhotos: PB_CONFIG.saveIndividualPhotos,
  removeWatermark: PB_CONFIG.removeWatermark,
  flipPhotosHorizontally: PB_CONFIG.flipPhotosHorizontally,
  collageStyle: PB_CONFIG.collageStyle,
  canChangeCollage: PB_CONFIG.canChangeCollage,
  canChangeFilter: PB_CONFIG.canChangeFilter,
  flash: PB_CONFIG.flash,
  filter: PB_CONFIG.filter,
  timerDuration: PB_CONFIG.timerDuration
});

const applyConfigWithDefaults = (
  config: Partial<ConfigState>,
  premium: boolean
): ConfigState => {
  const defaults = getDefaultConfig();
  return {
    title: config.title ?? defaults.title,
    subTitle: config.subTitle ?? defaults.subTitle,
    frameColor: config.frameColor ?? defaults.frameColor,
    textColor: config.textColor ?? defaults.textColor,
    customTitleFont: normalizeFontKey(
      config.customTitleFont ?? defaults.customTitleFont
    ),
    customTitleFontSize:
      config.customTitleFontSize ?? defaults.customTitleFontSize,
    customSubTitleFont: normalizeFontKey(
      config.customSubTitleFont ?? defaults.customSubTitleFont
    ),
    customSubTitleFontSize:
      config.customSubTitleFontSize ?? defaults.customSubTitleFontSize,
    autoSave: config.autoSave ?? defaults.autoSave,
    saveIndividualPhotos:
      config.saveIndividualPhotos ?? defaults.saveIndividualPhotos,
    removeWatermark:
      config.removeWatermark !== undefined && premium
        ? config.removeWatermark
        : defaults.removeWatermark,
    flipPhotosHorizontally:
      config.flipPhotosHorizontally ?? defaults.flipPhotosHorizontally,
    collageStyle: config.collageStyle ?? defaults.collageStyle,
    canChangeCollage: config.canChangeCollage ?? defaults.canChangeCollage,
    canChangeFilter: config.canChangeFilter ?? defaults.canChangeFilter,
    flash: config.flash ?? defaults.flash,
    filter: config.filter ?? defaults.filter,
    timerDuration: config.timerDuration ?? defaults.timerDuration
  };
};

export function PhotoBoothSettingsProvider({
  children
}: {
  children: ReactNode;
}) {
  const userId = useSelector((state: UserState) => state.uid);
  const premium = useSelector((state: UserState) => state.premium);
  const [config, setConfig] = useState<ConfigState>(getDefaultConfig());
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      log("Loading photo booth config...", "info");
      const fetchedConfig = await getPhotoBoothConfig(userId);
      const appliedConfig = applyConfigWithDefaults(fetchedConfig, premium);
      setConfig(appliedConfig);
    } catch (error) {
      log(`Error loading photo booth config: ${(error as any)?.message ?? error}`, "error");
      showErrorNotification("Error Loading Settings");
      const defaultConfig = getDefaultConfig();
      setConfig(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  }, [userId, premium]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const saveConfig = useCallback(async () => {
    if (isLoading) return;
    await savePhotoBoothConfig(userId, config as PhotoBoothConfig);
  }, [userId, isLoading, config]);

  useEffect(() => {
    if (isLoading) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveConfig();
    }, 250);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [userId, isLoading, config, saveConfig]);

  const updateConfig = useCallback(
    <K extends keyof ConfigState>(key: K, value: ConfigState[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const value: PhotoBoothSettingsValue = {
    ...config,
    isLoading,
    setTitle: (title: string) => updateConfig("title", title),
    setSubTitle: (subTitle: string) => updateConfig("subTitle", subTitle),
    setFrameColor: (frameColor: string) =>
      updateConfig("frameColor", frameColor),
    setTextColor: (textColor: string) => updateConfig("textColor", textColor),
    setCustomTitleFont: (font: string) => updateConfig("customTitleFont", font),
    setCustomTitleFontSize: (size: number) =>
      updateConfig("customTitleFontSize", size),
    setCustomSubTitleFont: (font: string) =>
      updateConfig("customSubTitleFont", font),
    setCustomSubTitleFontSize: (size: number) =>
      updateConfig("customSubTitleFontSize", size),
    setAutoSave: (autoSave: boolean) => updateConfig("autoSave", autoSave),
    setSaveIndividualPhotos: (save: boolean) =>
      updateConfig("saveIndividualPhotos", save),
    setRemoveWatermark: (remove: boolean) =>
      updateConfig("removeWatermark", remove),
    setFlipPhotosHorizontally: (flip: boolean) =>
      updateConfig("flipPhotosHorizontally", flip),
    setCollageStyle: (style: string) => updateConfig("collageStyle", style),
    setCanChangeCollage: (canChange: boolean) =>
      updateConfig("canChangeCollage", canChange),
    setCanChangeFilter: (canChange: boolean) =>
      updateConfig("canChangeFilter", canChange),
    setFlash: (flash: boolean) => updateConfig("flash", flash),
    setFilter: (filter: string) => updateConfig("filter", filter),
    setTimerDuration: (duration: number) =>
      updateConfig("timerDuration", duration)
  };

  return (
    <PhotoBoothSettingsContext.Provider value={value}>
      {children}
    </PhotoBoothSettingsContext.Provider>
  );
}
