import { GalleryPhoto } from "@/types/photoBoothGallery";

export type UploadItemStatus = "uploading" | "done" | "error";

export interface UploadQueueItem {
  id: string;
  eventTitle: string;
  photo: GalleryPhoto;
  status: UploadItemStatus;
}
