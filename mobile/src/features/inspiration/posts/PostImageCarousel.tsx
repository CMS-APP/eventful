import { useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";
import { syncPostImage } from "@/services/cache";
import { Photo } from "@/types/Photo";
import { AppError } from "@/utils/error";

import { ImageButtons } from "./images/ImageButtons";
import { ImageDots } from "./images/ImageDots";
import { PostImage } from "./images/PostImage";

interface PostImageCarouselProps {
  photos: Photo[];
  postId?: string;
}

export function PostImageCarousel({ photos, postId }: PostImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageUri, setCurrentImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadCachedImage() {
    if (photos.length === 0 || !postId) return;
    const currentPhoto = photos[currentIndex];
    try {
      const cachedImageUri = await syncPostImage(
        currentPhoto,
        postId,
        currentIndex
      );

      setCurrentImageUri(cachedImageUri);
    } catch (error) {
      new AppError(
        error,
        "PostImageCarousel: Error loading cached image",
        true
      );
      setCurrentImageUri(currentPhoto.uri);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCachedImage();
  }, [currentIndex, photos, postId]);

  return (
    <View style={styles.container}>
      {currentImageUri && (
        <PostImage currentImageUri={currentImageUri} loading={loading} />
      )}

      {photos.length > 1 && (
        <ImageButtons
          currentIndex={currentIndex}
          photos={photos}
          setCurrentIndex={setCurrentIndex}
        />
      )}

      {photos.length > 1 && (
        <ImageDots photos={photos} currentIndex={currentIndex} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    gap: 12,
    paddingVertical: 12
  }
});
