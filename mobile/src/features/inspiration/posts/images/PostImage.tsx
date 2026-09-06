import { ActivityIndicator } from "react-native-paper";

import { useEffect, useState } from "react";

import { Image, StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";

interface PostImageProps {
  currentImageUri: string | null;
  loading: boolean;
}

export function PostImage({ currentImageUri, loading }: PostImageProps) {
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const height = 300;

  async function getImageDimensions(imageUri: string) {
    const { width: imageWidth, height: imageHeight } =
      await Image.getSize(imageUri);

    const scaleFactor = height / imageHeight;

    setImageWidth(imageWidth * scaleFactor);
    setImageHeight(imageHeight * scaleFactor);
  }

  useEffect(() => {
    if (currentImageUri) {
      getImageDimensions(currentImageUri);
    }
  }, [currentImageUri]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.imageContainer}>
      {currentImageUri && !loading && (
        <Image
          source={{ uri: currentImageUri }}
          style={[styles.image, { width: imageWidth, height: imageHeight }]}
          resizeMode="cover"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center"
  },
  imageContainer: {
    alignSelf: "center",
    borderColor: colors.black,
    borderRadius: 12,
    borderWidth: 2
  },
  loadingContainer: {
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    justifyContent: "center"
  }
});
