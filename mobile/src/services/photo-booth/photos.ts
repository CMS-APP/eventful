import { PhotoResult } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

import { log } from "@/utils/logging";

export async function saveIndividualPhoto(photo: PhotoResult): Promise<void> {
  try {
    if (!photo.uri) {
      log("No URI found for photo", "warn");
      return;
    }

    await MediaLibrary.createAssetAsync(photo.uri);
  } catch (error) {
    log("Error saving photo: " + error, "error");
  }
}
