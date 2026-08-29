import { useMemo, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { ImageBackground } from "expo-image";

import { useAppDimensions } from "@/app/hooks/useAppDimensions";
import { Skeleton } from "@/design-system/components/feedback/Skeleton";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { GalleryPhoto } from "@/types/photoBoothGallery";

const DEFAULT_ASPECT_RATIO = 3 / 4;

export function GalleryPhotoItem({
  photo,
  onPhotoPress
}: {
  photo: GalleryPhoto;
  onPhotoPress: (photo: GalleryPhoto) => void;
}) {
  const maxWidth = useAppDimensions().screenWidth - 100;
  const maxHeight = useAppDimensions().screenHeight - 200;

  const imageUri = photo.url ?? photo.uri;
  const { photoId } = photo;

  const [loading, setLoading] = useState(true);

  const imageSize = useMemo(() => {
    const sourceWidth = photo.width ?? maxWidth;
    const sourceHeight = photo.height ?? sourceWidth / DEFAULT_ASPECT_RATIO;

    const widthScaleFactor = maxWidth / sourceWidth;
    const heightScaleFactor = maxHeight / sourceHeight;
    const scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);

    return {
      width: sourceWidth * scaleFactor,
      height: sourceHeight * scaleFactor
    };
  }, [photo.width, photo.height, maxWidth, maxHeight]);

  return (
    <TouchableOpacity
      style={styles.touchable}
      disabled={loading}
      onPress={() => onPhotoPress(photo)}
      hitSlop={getHitSlop("medium")}
    >
      <View style={styles.container}>
        <View style={[styles.imageWrapper, imageSize]}>
          {loading && (
            <Skeleton
              width={imageSize.width}
              height={imageSize.height}
              borderRadius={12}
              style={styles.skeleton}
            />
          )}
          <ImageBackground
            source={{
              uri: imageUri ?? "",
              cacheKey: photo.storageId ?? photoId
            }}
            cachePolicy="memory-disk"
            transition={300}
            style={[styles.imageBackground, imageSize]}
            onLoadEnd={() => setLoading(false)}
          >
            <View style={styles.typeContainer}>
              {!loading && photo.type === "cloud" && (
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="cloud" size={16} color={colors.white} />
                </View>
              )}
              {!loading && photo.type === "local" && (
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="folder" size={16} color={colors.white} />
                </View>
              )}
              {!loading && photo.type === "both" && (
                <>
                  <View style={styles.iconContainer}>
                    <FontAwesome5 name="cloud" size={16} color={colors.white} />
                  </View>
                  <View style={styles.iconContainer}>
                    <FontAwesome5
                      name="folder"
                      size={16}
                      color={colors.white}
                    />
                  </View>
                </>
              )}
            </View>
          </ImageBackground>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%"
  },
  iconContainer: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 30,
    justifyContent: "center",
    padding: 4,
    width: 30
  },
  imageBackground: {
    borderRadius: 12
  },
  imageWrapper: {
    justifyContent: "center"
  },
  skeleton: {
    position: "absolute"
  },
  touchable: {
    alignSelf: "stretch",
    width: "100%"
  },
  typeContainer: {
    alignItems: "flex-start",
    flexDirection: "row",
    flex: 1,
    gap: 4,
    justifyContent: "flex-end",
    right: -4,
    top: -4
  }
});
