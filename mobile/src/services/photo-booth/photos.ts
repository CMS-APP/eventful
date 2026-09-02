import { PhotoResult } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

import { log } from "@/utils/logging";

export function isOutOfStorageError(error: unknown): boolean {
  return String(error).includes("PHPhotosErrorDomain error 3305");
}

export async function saveIndividualPhoto(photo: PhotoResult): Promise<void> {
  if (!photo.uri) {
    log("No URI found for photo", "warn");
    return;
  }

  try {
    await MediaLibrary.createAssetAsync(photo.uri);
  } catch (error) {
    if (isOutOfStorageError(error)) {
      log("Error saving photo: device is out of storage", "error");
    } else {
      log("Error saving photo: " + error, "error");
    }
    throw error;
  }
}
