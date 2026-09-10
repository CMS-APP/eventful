import { createContext, useContext } from "react";

import { GalleryPhoto } from "@/types/photoBoothGallery";

export type QueueUploadResult = {
  succeeded: GalleryPhoto[];
  failed: GalleryPhoto[];
};

export type PhotoBoothUploadContextValue = {
  isUploading: boolean;
  queueUpload: (
    userId: string,
    eventTitle: string,
    photos: GalleryPhoto[]
  ) => Promise<QueueUploadResult>;
};

export const PhotoBoothUploadContext =
  createContext<PhotoBoothUploadContextValue | null>(null);

export function usePhotoBoothUpload(): PhotoBoothUploadContextValue {
  const ctx = useContext(PhotoBoothUploadContext);
  if (!ctx) {
    throw new Error(
      "usePhotoBoothUpload must be used within PhotoBoothUploadProvider"
    );
  }
  return ctx;
}
