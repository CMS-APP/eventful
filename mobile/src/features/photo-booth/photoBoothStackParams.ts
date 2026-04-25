import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { GalleryEvent, GalleryPhoto } from "@/types/photoBoothGallery";

export type PhotoBoothStackParamList = {
  PhotoBoothHome: undefined;
  PhotoBoothCamera: undefined;
  PhotoBoothResult: undefined;
  PhotoBoothRedoPhoto: { index: number };
  PhotoBoothCustomise: undefined;
  PhotoBoothLayout: undefined;
  PhotoBoothPreview: undefined;
  PhotoBoothTextColors: undefined;
  PhotoBoothSettings: undefined;
  PhotoBoothColorPicker: { type: string; color: string };
  PhotoBoothGallery: undefined;
  PhotoBoothEventGallery: {
    event: GalleryEvent;
    type: "local" | "cloud" | "both";
  };
  PhotoBoothPhoto: {
    photo: GalleryPhoto;
  };
};

export type PhotoBoothStackNavigation =
  NativeStackNavigationProp<PhotoBoothStackParamList>;
