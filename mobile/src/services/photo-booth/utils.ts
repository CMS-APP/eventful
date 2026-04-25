import * as Crypto from "expo-crypto";

import { GalleryEvent, GalleryPhoto } from "@/types/photoBoothGallery";
import { AppError } from "@/utils/error";

export function getPhotoIdSplit(photo: GalleryPhoto) {
  const photoId = photo.photoId;
  return photoId.split("/")[0];
}

export function checkIfPhotoExistsInLocalEvent(
  localEvent: GalleryEvent,
  photo: GalleryPhoto
) {
  return localEvent.photos.find(
    (p) => getPhotoIdSplit(p) === getPhotoIdSplit(photo)
  );
}

export async function convertEventTitleToHash(eventTitle: string) {
  try {
    if (!eventTitle || typeof eventTitle !== "string") {
      new AppError(
        "Event title must be a non-empty string",
        "PhotoBooth: Error converting event title to hash"
      );
      return "";
    }

    const cleanTitle = eventTitle
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-");

    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      cleanTitle
    );

    const shortHash = hash.substring(0, 16);

    return shortHash;
  } catch (error) {
    new AppError(error, "PhotoBooth: Error converting event title to hash");
    throw error;
  }
}
