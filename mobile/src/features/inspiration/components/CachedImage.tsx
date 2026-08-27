import { ActivityIndicator } from "react-native-paper";

import { useEffect, useState } from "react";

import { Image, ImageStyle, StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";
import {
  getImageFromCache,
  saveDatabaseImageToCache,
  saveLocalImageToCache
} from "@/services/local/cache";
import { Photo } from "@/types/Photo";
import { log } from "@/utils/logging";

interface CachedImageProps {
  photo: Photo;
  style?: ImageStyle;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
  postId?: string;
  imageIndex?: number;
}

export function CachedImage({
  photo,
  style,
  resizeMode = "cover",
  postId,
  imageIndex
}: CachedImageProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadCachedImage();
  }, [photo.uri]);

  const loadCachedImage = async () => {
    try {
      setLoading(true);
      setError(false);

      let cachedUri: string | null = null;
      let cacheFilename: string;

      // Use post-specific caching if postId and imageIndex are provided
      if (postId !== undefined && imageIndex !== undefined) {
        cacheFilename = `post_${postId}_${imageIndex}`;
        cachedUri = await getImageFromCache(cacheFilename);
      } else {
        // Fallback to generic caching
        cacheFilename =
          photo.id || photo.uri.split("/").pop()?.split("?")[0] || "image";
        cachedUri = await getImageFromCache(cacheFilename);
      }

      if (cachedUri) {
        log(`CachedImage: Using cached image for ${cacheFilename}`, "debug");
        setImageUri(cachedUri);
        setLoading(false);
        return;
      }

      // If not in cache, download and cache it
      log(
        `CachedImage: Downloading and caching image for ${cacheFilename}`,
        "debug"
      );
      let cachedPath: string | null = null;

      if (postId !== undefined && imageIndex !== undefined) {
        cachedPath = await saveLocalImageToCache(photo.uri, cacheFilename);
      } else {
        cachedPath = await saveDatabaseImageToCache(photo.uri, cacheFilename);
      }

      if (cachedPath) {
        setImageUri(cachedPath);
        log(
          `CachedImage: Successfully cached image for ${cacheFilename}`,
          "debug"
        );
      } else {
        // Fallback to original URI if caching fails
        setImageUri(photo.uri);
        log(
          `CachedImage: Fallback to original URI for ${cacheFilename}`,
          "warn"
        );
      }
    } catch (error) {
      log(`CachedImage: Error loading image: ${error}`, "error");
      setError(true);
      // Fallback to original URI
      setImageUri(photo.uri);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !imageUri) {
    return (
      <View style={[styles.errorContainer, style]}>
        <ActivityIndicator size="large" color={colors.gray} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUri }}
      style={[styles.image, style]}
      resizeMode={resizeMode}
    />
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    alignItems: "center",
    backgroundColor: colors.lightGray,
    justifyContent: "center"
  },
  image: {
    height: "100%",
    width: "100%"
  },
  loadingContainer: {
    alignItems: "center",
    backgroundColor: colors.lightGray,
    justifyContent: "center"
  }
});
