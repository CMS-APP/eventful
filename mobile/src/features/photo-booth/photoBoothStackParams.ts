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
  };
  PhotoBoothPhoto: {
    photo: GalleryPhoto;
  };
  PhotoBoothGuidedAccessInfo: undefined;
};

export type PhotoBoothStackNavigation =
  NativeStackNavigationProp<PhotoBoothStackParamList>;
