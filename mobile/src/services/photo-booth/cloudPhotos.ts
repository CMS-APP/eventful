import AsyncStorage from "@react-native-async-storage/async-storage";
import { serverTimestamp, where } from "@react-native-firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable
} from "@react-native-firebase/storage";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import { SaveFormat } from "expo-image-manipulator";

import { API_COLLECTIONS } from "@/services/api/constants";
import { createDocument } from "@/services/api/create";
import { deleteDocument } from "@/services/api/delete";
import { getDocumentsByQuery } from "@/services/api/get";
import { FIREBASE_STORAGE } from "@/services/firebase/firebase";
import { GalleryEvent, GalleryPhoto } from "@/types/photoBoothGallery";
import { parseDatabaseDate } from "@/utils/date";
import { log } from "@/utils/logging";

import { getPhotosDataLocally } from "./localPhotos";
import { convertEventTitleToHash } from "./utils";

async function getCloudPhotos(userId: string) {
  try {
    log("Getting cloud photos for user: " + userId, "info");
    const photos = await getDocumentsByQuery(
      [where("userId", "==", userId)],
      API_COLLECTIONS.PHOTO_BOOTH_PHOTOS
    );

    return photos;
  } catch (error) {
    log(`Error getting cloud photos: ${(error as any)?.message ?? error}`, "error");
    return [];
  }
}

export async function getCloudEvents(userId: string) {
  const photos = await getCloudPhotos(userId);

  const events: GalleryEvent[] = [];
  for (const photo of photos as GalleryPhoto[]) {
    if (!events.find((event) => event.eventTitle === photo.eventTitle)) {
      events.push({
        eventTitle: photo.eventTitle,
        photos: [photo],
        date: photo.createdAt,
        type: "cloud"
      });
    } else {
      events.find((event) => event.eventTitle === photo.eventTitle)?.photos.push(photo);
      if (
        parseDatabaseDate(
          events.find((event) => event.eventTitle === photo.eventTitle)?.date
        )?.getTime() > photo.createdAt.toDate().getTime()
      ) {
        events.find((event) => event.eventTitle === photo.eventTitle)!.date =
          photo.createdAt;
      }
    }
  }

  return events;
}

export async function downloadCloudPhotos(
  event: GalleryEvent,
  photos: GalleryPhoto[]
) {
  try {
    const photoData = await getPhotosDataLocally();
    for (const photo of photos) {
      const sourceUri = photo.url ?? photo.uri;
      if (!sourceUri) {
        continue;
      }

      const photoIdFormatted = photo.photoId.split("/")[0];
      const cacheDir = FileSystem.cacheDirectory;
      const destUri = `${cacheDir}photo-booth-${photoIdFormatted}-${Date.now()}.jpg`;
      await FileSystem.downloadAsync(sourceUri, destUri);
      const combinedAsset = await MediaLibrary.createAssetAsync(destUri);

      const createdAt =
        parseDatabaseDate(photo.createdAt ?? event.date)?.toISOString() ??
        new Date().toISOString();

      photoData.push({
        photoId: photoIdFormatted,
        eventTitle: event.eventTitle,
        createdAt,
        url: combinedAsset.uri,
        uri: combinedAsset.uri
      });
    }
    await AsyncStorage.setItem("photosData", JSON.stringify(photoData));
  } catch (error) {
    log(`Error downloading cloud photos: ${(error as any)?.message ?? error}`, "error");
  }
}

export async function downloadCloudPhoto(photo: GalleryPhoto, userId: string) {
  try {
    const photoData = await getPhotosDataLocally();
    const sourceUri = photo.url ?? photo.uri;
    if (!sourceUri) {
      return;
    }

    const photoIdFormatted = photo.photoId.split("/")[0];
    const cacheDir = FileSystem.cacheDirectory;
    const destUri = `${cacheDir}photo-booth-${photoIdFormatted}-${Date.now()}.jpg`;
    await FileSystem.downloadAsync(sourceUri, destUri);
    const combinedAsset = await MediaLibrary.createAssetAsync(destUri);

    photoData.push({
      photoId: photoIdFormatted,
      eventTitle: photo.eventTitle,
      createdAt: photo.createdAt,
      url: combinedAsset.uri,
      uri: combinedAsset.uri
    });

    await AsyncStorage.setItem("photosData", JSON.stringify(photoData));
  } catch (error) {
    log(`Error downloading photo cloud: ${(error as any)?.message ?? error}`, "error");
    throw error;
  }
}

export async function deletePhotoCloud(photo: GalleryPhoto, userId: string) {
  try {
    const storageId = photo.photoId.split("/")[0];
    const eventTitleHash = await convertEventTitleToHash(photo.eventTitle);
    const storagePath = `gallery/${userId}/${eventTitleHash}/${storageId}.jpg`;

    const storageRef = ref(FIREBASE_STORAGE, storagePath);
    await deleteObject(storageRef);
    await deleteDocument(API_COLLECTIONS.PHOTO_BOOTH_PHOTOS, storageId);
  } catch (error) {
    log(`PhotoBooth: Error deleting photo booth image: ${(error as any)?.message ?? error}`, "error");
    throw error;
  }
}

async function compressImage(localUri: string) {
  try {
    const compressedImage = await ImageManipulator.manipulateAsync(
      localUri,
      [{ resize: { width: 1200 } }],
      {
        compress: 0.8,
        format: SaveFormat.JPEG
      }
    );

    return compressedImage.uri;
  } catch (error) {
    log(`Error compressing image: ${(error as any)?.message ?? error}`, "error");
    throw error;
  }
}

export async function uploadPhotosToCloud(
  userId: string,
  eventTitle: string,
  photos: GalleryPhoto[]
) {
  try {
    const eventTitleHash = await convertEventTitleToHash(eventTitle);
    const storagePath = `gallery/${userId}/${eventTitleHash}`;

    const uploadPromises = photos.map(async (photo) => {
      const photoId = photo.photoId;
      const finalPhotoId = photoId.split("/")[0];
      const photoRef = ref(FIREBASE_STORAGE, `${storagePath}/${finalPhotoId}.jpg`);
      const asset = await MediaLibrary.getAssetInfoAsync(photoId);
      const localUri = asset.localUri || asset.uri;
      const response = await fetch(localUri);
      let blob = await response.blob();

      if (blob.size > 1024 * 1024) {
        const compressedImage = await compressImage(localUri);
        const compressedResponse = await fetch(compressedImage);
        blob = await compressedResponse.blob();
      }

      await uploadBytesResumable(photoRef, blob as Blob);
      const downloadURL = await getDownloadURL(photoRef);

      await createDocument(
        {
          url: downloadURL,
          userId,
          eventTitle,
          photoId: finalPhotoId,
          createdAt: serverTimestamp()
        },
        API_COLLECTIONS.PHOTO_BOOTH_PHOTOS,
        finalPhotoId
      );
    });

    await Promise.all(uploadPromises);
  } catch (error) {
    log(`Error uploading photos to cloud: ${(error as any)?.message ?? error}`, "error");
    throw error;
  }
}
