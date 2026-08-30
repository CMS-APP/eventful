import AsyncStorage from "@react-native-async-storage/async-storage";
import { serverTimestamp, where } from "@react-native-firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable
} from "@react-native-firebase/storage";

import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";

import { FIREBASE_STORAGE } from "@/app/init/firebase";
import { API_COLLECTIONS } from "@/services/api/constants";
import { createDocument } from "@/services/api/create";
import { deleteDocument } from "@/services/api/delete";
import { getDocumentsByQuery } from "@/services/api/get";
import { GalleryEvent, GalleryPhoto } from "@/types/photoBoothGallery";
import { parseDatabaseDate } from "@/utils/date";
import { log } from "@/utils/logging";
import { generateUUID } from "@/utils/uuid";

import { getPhotosDataLocally } from "./localPhotos";
import { convertEventTitleToHash, getPhotoIdSplit } from "./utils";

async function getCloudPhotos(userId: string) {
  try {
    const photos = await getDocumentsByQuery(
      [where("userId", "==", userId)],
      API_COLLECTIONS.PHOTO_BOOTH_PHOTOS
    );

    return photos;
  } catch (error) {
    log(`Error getting cloud photos: ${error}`, "error");
    return [];
  }
}

export async function getCloudEvents(userId: string) {
  const photos = await getCloudPhotos(userId);

  const events: GalleryEvent[] = [];
  for (const rawPhoto of photos as (GalleryPhoto & { id: string })[]) {
    const photo: GalleryPhoto = {
      ...rawPhoto,
      type: "cloud",
      storageId: rawPhoto.id
    };
    if (!events.find((event) => event.eventTitle === photo.eventTitle)) {
      events.push({
        eventTitle: photo.eventTitle,
        photos: [photo],
        date: photo.createdAt,
        type: "cloud"
      });
    } else {
      events
        .find((event) => event.eventTitle === photo.eventTitle)
        ?.photos.push(photo);
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
}

export async function downloadCloudPhoto(photo: GalleryPhoto, userId: string) {
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
}

async function findStorageIdForPhoto(photo: GalleryPhoto, userId: string) {
  const matches = await getDocumentsByQuery(
    [
      where("userId", "==", userId),
      where("eventTitle", "==", photo.eventTitle),
      where("photoId", "==", getPhotoIdSplit(photo))
    ],
    API_COLLECTIONS.PHOTO_BOOTH_PHOTOS
  );

  return matches[0]?.id;
}

export async function deletePhotoCloud(photo: GalleryPhoto, userId: string) {
  const storageId =
    photo.storageId ?? (await findStorageIdForPhoto(photo, userId));

  if (!storageId) {
    return;
  }

  const eventTitleHash = await convertEventTitleToHash(photo.eventTitle);
  const storagePath = `gallery/${userId}/${eventTitleHash}/${storageId}.jpg`;

  const storageRef = ref(FIREBASE_STORAGE, storagePath);
  await deleteObject(storageRef);
  await deleteDocument(API_COLLECTIONS.PHOTO_BOOTH_PHOTOS, storageId);
}

export async function uploadPhotosToCloud(
  userId: string,
  eventTitle: string,
  photos: GalleryPhoto[]
) {
  const eventTitleHash = await convertEventTitleToHash(eventTitle);
  const storagePath = `gallery/${userId}/${eventTitleHash}`;

  const uploadPromises = photos.map(async (photo) => {
    const photoId = photo.photoId;
    const localMatchId = photoId.split("/")[0];
    const storageId = generateUUID();
    const photoRef = ref(FIREBASE_STORAGE, `${storagePath}/${storageId}.jpg`);
    const asset = await MediaLibrary.getAssetInfoAsync(photoId);
    const localUri = asset.localUri || asset.uri;
    const response = await fetch(localUri);
    const blob = await response.blob();

    await uploadBytesResumable(photoRef, blob as Blob);
    const downloadURL = await getDownloadURL(photoRef);

    await createDocument(
      {
        url: downloadURL,
        userId,
        eventTitle,
        photoId: localMatchId,
        width: asset.width,
        height: asset.height,
        createdAt: serverTimestamp()
      },
      API_COLLECTIONS.PHOTO_BOOTH_PHOTOS,
      storageId
    );

    return {
      photoId: localMatchId,
      storageId,
      url: downloadURL,
      width: asset.width,
      height: asset.height
    };
  });

  const results = await Promise.all(uploadPromises);

  const resultsByPhotoId = new Map(
    results.map((result) => [result.photoId, result])
  );
  const photoData = await getPhotosDataLocally();
  const updatedPhotoData = photoData.map((localPhoto: GalleryPhoto) => {
    const result = resultsByPhotoId.get(getPhotoIdSplit(localPhoto));
    return result
      ? {
          ...localPhoto,
          storageId: result.storageId,
          url: result.url,
          width: result.width,
          height: result.height
        }
      : localPhoto;
  });
  await AsyncStorage.setItem("photosData", JSON.stringify(updatedPhotoData));

  return results;
}
