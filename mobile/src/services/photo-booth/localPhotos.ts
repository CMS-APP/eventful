import AsyncStorage from "@react-native-async-storage/async-storage";
import Share from "react-native-share";

import { File, Paths } from "expo-file-system";
import * as LegacyFileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";

import { GalleryEvent, GalleryPhoto } from "@/types/photoBoothGallery";
import { formatDate, parseDatabaseDate } from "@/utils/date";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

import { getPhotoIdSplit } from "./utils";

function mediaLibraryAssetRef(
  photo: GalleryPhoto & { id?: string; uri?: string }
) {
  const uri = photo.url ?? photo.uri;
  if (uri?.startsWith("ph://")) {
    return uri.slice("ph://".length);
  }
  if (photo.photoId) {
    return photo.photoId;
  }
  if (photo.id) {
    return photo.id;
  }
  return uri ?? "";
}

export async function getPhotosDataLocally() {
  try {
    const photoData = await AsyncStorage.getItem("photosData");
    if (!photoData) {
      return [];
    }

    return JSON.parse(photoData);
  } catch (error) {
    log(
      `Error getting photo data: ${(error as any)?.message ?? error}`,
      "error"
    );
    return [];
  }
}

export async function savePhotoDataLocally(
  photoId: string,
  eventTitle: string,
  subtitle: string,
  date: Date,
  uri: string
): Promise<void> {
  try {
    const photoData = await getPhotosDataLocally();
    const stringDate = date.toISOString();

    if (!eventTitle || eventTitle === "") {
      eventTitle = formatDate(date);
    }

    const photoIdFormatted = photoId.split("/")[0];

    photoData.push({
      photoId: photoIdFormatted,
      eventTitle: eventTitle ?? stringDate,
      subtitle: subtitle,
      createdAt: stringDate,
      url: uri
    });

    await AsyncStorage.setItem("photosData", JSON.stringify(photoData));
  } catch (error) {
    log(
      `Error saving photo data: ${(error as any)?.message ?? error}`,
      "error"
    );
  }
}

export async function deletePhotoLocally(photo: GalleryPhoto): Promise<void> {
  try {
    const photoData = await getPhotosDataLocally();
    const filteredPhotoData = photoData.filter(
      (p: GalleryPhoto) => getPhotoIdSplit(p) !== getPhotoIdSplit(photo)
    );

    await MediaLibrary.deleteAssetsAsync([mediaLibraryAssetRef(photo)]);
    await AsyncStorage.setItem("photosData", JSON.stringify(filteredPhotoData));
  } catch (error) {
    log(
      `Error deleting photo data: ${(error as any)?.message ?? error}`,
      "error"
    );
  }
}

export async function getLocalEvents(): Promise<GalleryEvent[]> {
  const eventsData: { [key: string]: GalleryEvent } = {};

  try {
    const newPhotosData = [] as GalleryPhoto[];
    const photosData = await getPhotosDataLocally();
    if (!photosData || photosData.length === 0) {
      return [];
    }

    const assetChecks = await Promise.allSettled(
      photosData.map((photo: GalleryPhoto & { id?: string; uri?: string }) => {
        const ref = mediaLibraryAssetRef(photo);
        if (!ref) {
          log("No ref found for photo: " + photo.photoId, "warn");
          return Promise.resolve(null);
        }
        return MediaLibrary.getAssetInfoAsync(ref);
      })
    );

    for (let i = 0; i < photosData.length; i++) {
      const photo = photosData[i];
      photo.type = "local";
      const assetResult = assetChecks[i];

      if (assetResult.status === "rejected" || !assetResult.value) {
        log("No asset found for photo: " + JSON.stringify(photo), "warn");
        continue;
      }

      newPhotosData.push({
        ...photo
      });

      if (!eventsData[photo.eventTitle]) {
        eventsData[photo.eventTitle] = {
          eventTitle: photo.eventTitle,
          photos: [photo],
          date: photo.createdAt,
          type: "local"
        };
      } else {
        eventsData[photo.eventTitle].photos.push(photo);
      }

      const storedEventDate = parseDatabaseDate(
        eventsData[photo.eventTitle].date
      );

      const photoTime =
        photo.createdAt ??
        (photo as GalleryPhoto & { date?: string }).date ??
        null;
      const photoDate = parseDatabaseDate(photoTime);

      if (!storedEventDate || !photoDate) {
        continue;
      }

      if (photoDate < storedEventDate) {
        eventsData[photo.eventTitle].date = photoTime as GalleryEvent["date"];
      }
    }

    await AsyncStorage.setItem("photosData", JSON.stringify(newPhotosData));
    return Object.values(eventsData);
  } catch (error) {
    log(
      `Error getting events data: ${(error as any)?.message ?? error}`,
      "error"
    );
    return [];
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onloadend = () => {
      const result = reader.result?.toString() ?? "";
      resolve(result.split(",")[1] ?? "");
    };
    reader.readAsDataURL(blob);
  });
}

async function copyImageToShareCache(readUri: string): Promise<string> {
  const response = await fetch(readUri);
  const blob = await response.blob();
  const base64data = await blobToBase64(blob);
  const cacheFile = new File(
    Paths.cache,
    `photo-booth-share-${Date.now()}.png`
  );
  if (cacheFile.exists) {
    cacheFile.delete();
  }
  cacheFile.write(base64data, { encoding: "base64" });
  return cacheFile.uri;
}

async function copyContentUriToShareCache(contentUri: string): Promise<string> {
  const cacheFile = new File(
    Paths.cache,
    `photo-booth-share-${Date.now()}.png`
  );
  if (cacheFile.exists) {
    cacheFile.delete();
  }
  await LegacyFileSystem.copyAsync({ from: contentUri, to: cacheFile.uri });
  return cacheFile.uri;
}

async function resolveUriForShare(uri: string): Promise<string> {
  const trimmed = uri.trim();
  if (!trimmed) {
    throw new Error("Missing image URI");
  }
  if (trimmed.startsWith("ph://")) {
    const assetId = trimmed.slice("ph://".length);
    const asset = await MediaLibrary.getAssetInfoAsync(assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }
    const readUri = asset.localUri ?? asset.uri;
    return copyImageToShareCache(readUri);
  }
  if (trimmed.startsWith("content://")) {
    return copyContentUriToShareCache(trimmed);
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return copyImageToShareCache(trimmed);
  }
  if (trimmed.startsWith("file://")) {
    return trimmed;
  }
  return copyImageToShareCache(trimmed);
}

export async function sharePhoto(uri: string): Promise<void> {
  try {
    const shareUrl = await resolveUriForShare(uri);
    await Share.open({
      title: "Share Photo",
      url: shareUrl,
      type: "image/png",
      message: "Check out this photo from Eventful's photo booth!",
      filename: "Photo Booth Photo"
    });
  } catch (error) {
    const message = (error as Error)?.message ?? "";
    if (message !== "User did not share") {
      log(`Error sharing photo: ${(error as any)?.message ?? error}`, "error");
      showErrorToast("Error Sharing Photo");
    }
  }
}
