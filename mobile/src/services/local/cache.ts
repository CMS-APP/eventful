import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";

import { Photo } from "@/types/Photo";
import { User } from "@/types/User";

import { log } from "../../utils/logging";
import { downloadImageAsync } from "../firebase/firebaseStorage";
import { updateUserInfo } from "../firebase/firebaseUserFunctions";

function getImageCacheDirectory(): FileSystem.Directory {
  const cachePath = FileSystem.Paths.cache;
  const cacheUri = typeof cachePath === "string" ? cachePath : cachePath.uri;
  return new FileSystem.Directory(cacheUri, "images");
}

const getCachedImageFile = (filename: string) =>
  new FileSystem.File(getImageCacheDirectory(), `${filename}.jpg`);

async function createCacheImageFolder() {
  const imageCacheDirectory = getImageCacheDirectory();
  const dirInfo = imageCacheDirectory.info();
  if (!dirInfo.exists) {
    imageCacheDirectory.create({
      intermediates: true,
      idempotent: true
    });
  }
}

export async function getImageFromCache(filename: string) {
  const imageFile = getCachedImageFile(filename);
  const imageInfo = imageFile.info();
  return imageInfo.exists ? imageFile.uri : null;
}

export async function saveLocalImageToCache(
  localUri: string,
  filename: string,
  overwrite: boolean = false
) {
  try {
    await createCacheImageFolder();

    const cacheFile = getCachedImageFile(filename);
    const sourceFile = new FileSystem.File(localUri);

    if (cacheFile.info().exists && !overwrite) {
      return cacheFile.uri;
    }

    if (cacheFile.info().exists && overwrite) {
      cacheFile.delete();
    }

    sourceFile.copy(cacheFile);
    return cacheFile.uri;
  } catch (error: any) {
    if (
      error?.code === "ERR_FILESYSTEM_DESTINATION_EXISTS" ||
      error?.message?.includes("already exists") ||
      error?.message?.includes("Destination already exists")
    ) {
      const cacheFile = getCachedImageFile(filename);
      if (cacheFile.info().exists) {
        return cacheFile.uri;
      }
    }
    throw error;
  }
}

export async function saveDatabaseImageToCache(
  url: string,
  filename: string,
  overwrite: boolean = false
) {
  if (
    !url ||
    !filename ||
    typeof url !== "string" ||
    typeof filename !== "string" ||
    filename.includes("/")
  ) {
    throw new Error("Invalid URL or filename provided");
  }

  await createCacheImageFolder();

  const cacheFile = getCachedImageFile(filename);

  try {
    if (cacheFile.info().exists && !overwrite) {
      return cacheFile.uri;
    }

    if (cacheFile.info().exists && overwrite) {
      cacheFile.delete();
    }

    const downloadedFile = await FileSystem.File.downloadFileAsync(
      url,
      cacheFile
    );
    return downloadedFile.uri;
  } catch (error: any) {
    if (
      error?.code === "ERR_FILESYSTEM_DESTINATION_EXISTS" ||
      error?.message?.includes("already exists") ||
      error?.message?.includes("Destination already exists")
    ) {
      if (cacheFile.info().exists) {
        return cacheFile.uri;
      }
    }
    log(
      `CacheStorage: Error saving image to cache: ${(error as any)?.message ?? error}`,
      "error"
    );
    return null;
  }
}

export async function deleteCachedImage(filename: string) {
  const cacheFile = getCachedImageFile(filename);

  try {
    cacheFile.delete();
  } catch (error) {
    if (
      (error as Error & { code: string }).code ===
      "ERR_FILESYSTEM_CANNOT_DELETE"
    ) {
      log(`Image not found in cache: ${filename}`, "warn");
      return;
    }
    throw error;
  }
}

export async function computeImageHash(imageUri: string) {
  const fileContents = await new FileSystem.File(imageUri).base64();
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    fileContents
  );
}

export async function syncUserPicture(user: User, activeUser = false) {
  if (!user || !user.uid) {
    log("CacheStorage: No user or user ID provided", "warn");
    return null;
  }

  const path = activeUser ? "profilePicture" : `${user.uid}_profilePicture`;
  const cachedImage = await getImageFromCache(path);

  if (!cachedImage && !user.profilePictureHash) {
    return null;
  }

  if (!cachedImage && user.profilePictureHash) {
    return await handleImageDownload(user, path);
  }

  if (cachedImage && !user.profilePictureHash) {
    await deleteCachedImage(path);
    return null;
  }

  if (cachedImage && user.profilePictureHash) {
    const cachedImageHash = await computeImageHash(cachedImage);

    if (cachedImageHash !== user.profilePictureHash) {
      const imageUri = await handleImageDownload(user, path, true);
      const newHash = await computeImageHash(imageUri as string);

      if (newHash !== user.profilePictureHash) {
        await updateUserInfo(user.uid, {
          profilePictureHash: newHash as string
        });
      }
      return imageUri;
    } else {
      return cachedImage;
    }
  }
}

export async function syncPostImage(
  photo: Photo,
  postId: string,
  index: number
) {
  const cacheFilename = `post::${postId}_${index.toString()}`;
  const cachedImage = await getImageFromCache(cacheFilename);
  if (!cachedImage) {
    return await saveDatabaseImageToCache(photo.uri, cacheFilename);
  }
  return cachedImage;
}

async function handleImageDownload(
  user: User,
  path: string,
  overwrite: boolean = false
) {
  try {
    const url = await downloadImageAsync(`${user.uid}/profilePicture`);
    return await saveDatabaseImageToCache(url, path, overwrite);
  } catch (error) {
    if ((error as { code: string }).code === "storage/object-not-found") {
      log("CacheStorage: Image not in storage - should remove", "warn");
    } else {
      throw error;
    }
  }
}

export async function clearCache() {
  const imageCacheDirectory = getImageCacheDirectory();
  imageCacheDirectory.delete();
  await createCacheImageFolder();
}
