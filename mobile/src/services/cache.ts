import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";

import { Photo } from "@/types/Photo";
import { User } from "@/types/User";
import { AppError } from "@/utils/error";

import { log } from "../utils/logging";
import { downloadImageAsync } from "./firebase/firebaseStorage";
import { updateUserInfo } from "./firebase/firebaseUserFunctions";

// Helper function to get the image cache directory safely
function getImageCacheDirectory(): FileSystem.Directory {
  const cachePath = FileSystem.Paths.cache;
  if (!cachePath) {
    throw new Error("Cache directory path is not available");
  }

  const cacheUri = typeof cachePath === "string" ? cachePath : cachePath.uri;
  if (!cacheUri) {
    throw new Error("Cache directory URI is not available");
  }
  return new FileSystem.Directory(cacheUri, "images");
}

const getCachedImageFile = (filename: string) =>
  new FileSystem.File(getImageCacheDirectory(), `${filename}.jpg`);

async function createCacheImageFolder() {
  try {
    const imageCacheDirectory = getImageCacheDirectory();
    const dirInfo = imageCacheDirectory.info();
    if (!dirInfo.exists) {
      await imageCacheDirectory.create({
        intermediates: true,
        idempotent: true
      });
    }
  } catch (error) {
    throw new AppError(
      error,
      "CacheStorage: Error creating image cache directory"
    );
  }
}

export async function getImageFromCache(filename: string) {
  const imageFile = getCachedImageFile(filename);

  try {
    const { exists } = imageFile.info();
    return exists ? imageFile.uri : null;
  } catch (error) {
    throw new AppError(error, "CacheStorage: Error getting image from cache");
  }
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

    await sourceFile.copy(cacheFile);
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
    throw new AppError(error, "CacheStorage: Error saving image to cache");
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
    throw new AppError(
      "Invalid URL or filename provided",
      "CacheStorage: Error saving image to cache"
    );
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
    new AppError(error, "CacheStorage: Error saving image to cache");
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
      log(`CacheStorage: Image not found in cache: ${filename}`, "warn");
      return;
    }
    throw new AppError(error, "CacheStorage: Error deleting image from cache");
  }
}

export async function computeImageHash(imageUri: string) {
  try {
    const fileContents = await new FileSystem.File(imageUri).base64();
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      fileContents
    );
    return hash;
  } catch (error) {
    throw new AppError(error, "CacheStorage: Error computing image hash");
  }
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
        log(
          "CacheStorage: Hash mismatch after download - Updating Hash in Database",
          "info"
        );
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
      throw new AppError(
        error,
        "CacheStorage: Error downloading or caching image"
      );
    }
  }
}

export async function clearCache() {
  try {
    const imageCacheDirectory = getImageCacheDirectory();
    imageCacheDirectory.delete();
    await createCacheImageFolder();
  } catch (error) {
    throw new AppError(error, "CacheStorage: Error clearing image cache");
  }
}
