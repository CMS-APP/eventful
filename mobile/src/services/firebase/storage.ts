import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable
} from "@react-native-firebase/storage";

import * as ImageManipulator from "expo-image-manipulator";
import { SaveFormat } from "expo-image-manipulator";

import { FIREBASE_STORAGE } from "@/app/init/firebase";
import { log } from "@/utils/logging";

export async function downloadImageAsync(storageString: string) {
  const storageRef = ref(FIREBASE_STORAGE, storageString + ".jpg");
  return await getDownloadURL(storageRef);
}

export async function uploadImageAsync(
  uri: string,
  storageString: string,
  quality: number
) {
  const compressImage = async (uri: string) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(uri, [], {
        compress: quality,
        format: SaveFormat.WEBP
      });
      return manipResult.uri;
    } catch (error) {
      log("Image compression warning: " + error, "warn");
      return uri;
    }
  };

  function getBlob(uri: string) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = (error) => {
        log("Warning: " + error, "warn");
        reject(new TypeError("Network Error Failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
  }

  let compressedUri = uri;

  // Skip compression for small images (e.g., < 1MB)
  const blob = (await getBlob(uri)) as Blob;
  const sizeInMB = blob.size / (1024 * 1024);

  if (sizeInMB > 1) {
    compressedUri = await compressImage(uri);
  }

  const compressedBlob = (await getBlob(compressedUri)) as Blob;
  const storageRef = ref(FIREBASE_STORAGE, storageString + ".jpg");
  await uploadBytesResumable(storageRef, compressedBlob);
}

export async function deleteImageAsync(storageString: string) {
  const storageRef = ref(FIREBASE_STORAGE, storageString + ".jpg");
  await deleteObject(storageRef);
}

export async function deleteUserImageAsnyc(userId: string) {
  try {
    await deleteImageAsync(`${userId}/profilePicture`);
  } catch (error) {
    if ((error as any).code === "storage/object-not-found") {
      log(`User image "${userId}" does not exist`, "warn");
      return;
    }
    log(`Error deleting user image "${userId}": ${error}`, "error");
    throw error;
  }
}
