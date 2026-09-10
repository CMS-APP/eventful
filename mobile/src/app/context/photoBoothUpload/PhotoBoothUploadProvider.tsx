import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { PhotoBoothUploadBar } from "@/app/context/photoBoothUpload/PhotoBoothUploadBar";
import {
  PhotoBoothUploadContext,
  QueueUploadResult
} from "@/app/context/photoBoothUpload/PhotoBoothUploadContext";
import { trackPhotoBoothPhotosUploaded } from "@/services/analytics/events";
import { uploadPhotosToCloud } from "@/services/photo-booth/cloudPhotos";
import { GalleryPhoto } from "@/types/photoBoothGallery";
import { UploadQueueItem } from "@/types/PhotoBoothUpload";
import { generateUUID } from "@/utils/uuid";

const CLEAR_DELAY_MS = 2000;

export function PhotoBoothUploadProvider({
  children
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const uploadInProgressRef = useRef(false);

  const isUploading = useMemo(
    () => items.some((item) => item.status === "uploading"),
    [items]
  );

  useEffect(() => {
    if (
      items.length === 0 ||
      items.some((item) => item.status === "uploading")
    ) {
      return;
    }
    const timeout = setTimeout(() => setItems([]), CLEAR_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [items]);

  const queueUpload = useCallback(
    async (
      userId: string,
      eventTitle: string,
      photos: GalleryPhoto[]
    ): Promise<QueueUploadResult> => {
      if (photos.length === 0) return { succeeded: [], failed: [] };
      if (uploadInProgressRef.current) return { succeeded: [], failed: [] };

      uploadInProgressRef.current = true;

      try {
        const idByPhoto = new Map(
          photos.map((photo) => [photo, generateUUID()])
        );
        const newItems: UploadQueueItem[] = photos.map((photo) => ({
          id: idByPhoto.get(photo)!,
          eventTitle,
          photo,
          status: "uploading"
        }));

        setItems((prev) => [...prev, ...newItems]);
        setDismissed(false);

        const succeeded: GalleryPhoto[] = [];
        const failed: GalleryPhoto[] = [];

        await uploadPhotosToCloud(
          userId,
          eventTitle,
          photos,
          (photo, result) => {
            const id = idByPhoto.get(photo)!;
            setItems((prev) =>
              prev.map((item) =>
                item.id === id
                  ? { ...item, status: result ? "done" : "error" }
                  : item
              )
            );

            if (result) {
              succeeded.push({
                ...photo,
                type: "both",
                storageId: result.storageId,
                url: result.url,
                width: result.width,
                height: result.height
              });
            } else {
              failed.push(photo);
            }
          }
        );

        trackPhotoBoothPhotosUploaded(succeeded.length);

        return { succeeded, failed };
      } finally {
        uploadInProgressRef.current = false;
      }
    },
    []
  );

  const handleDismiss = useCallback(() => setDismissed(true), []);

  const contextValue = useMemo(
    () => ({ queueUpload, isUploading }),
    [queueUpload, isUploading]
  );

  return (
    <PhotoBoothUploadContext.Provider value={contextValue}>
      {children}
      <PhotoBoothUploadBar
        items={items}
        visible={items.length > 0 && !dismissed}
        onDismiss={handleDismiss}
      />
    </PhotoBoothUploadContext.Provider>
  );
}
