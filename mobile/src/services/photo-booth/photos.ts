import { PhotoResult } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

import { log } from "@/utils/logging";

export async function saveIndividualPhoto(photo: PhotoResult): Promise<void> {
  try {
    if (!photo.uri) {
      log("No URI found for photo", "warn");
      return;
    }

    log("Saving photo: " + photo.uri, "info");
    const asset = await MediaLibrary.createAssetAsync(photo.uri);
    log("Photo saved: " + asset.id, "info");
  } catch (error) {
    log("Error saving photo: " + error, "error");
  }
}
