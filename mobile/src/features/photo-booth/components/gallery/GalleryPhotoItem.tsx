import { ActivityIndicator } from "react-native-paper";

import { useCallback, useEffect, useState } from "react";

import {
  Image as RNImage,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { ImageBackground } from "expo-image";

import { colors } from "@/design-system/tokens/colors";
import { useAppDimensions } from "@/hooks/useAppDimensions";
import { GalleryPhoto } from "@/types/photoBoothGallery";
import { getHitSlop } from "@/utils/hitSlop";

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

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);

  const calculateImageSize = useCallback(() => {
    if (imageUri) {
      RNImage.getSize(imageUri, (width, height) => {
        const widthScaleFactor = maxWidth / width;
        const heightScaleFactor = maxHeight / height;
        const scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);
        setImageSize({
          width: width * scaleFactor,
          height: height * scaleFactor
        });
      });
    }
  }, [imageUri, maxWidth, maxHeight]);

  useEffect(() => {
    calculateImageSize();
  }, [calculateImageSize]);

  return (
    <TouchableOpacity
      style={styles.touchable}
      disabled={loading}
      onPress={() => onPhotoPress(photo)}
      hitSlop={getHitSlop("medium")}
    >
      <View style={styles.container}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        <ImageBackground
          source={{ uri: imageUri ?? "", cacheKey: photoId }}
          cachePolicy="memory-disk"
          style={{
            width: imageSize.width,
            height: imageSize.height,
            borderRadius: 12
          }}
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
                  <FontAwesome5 name="folder" size={16} color={colors.white} />
                </View>
              </>
            )}
          </View>
        </ImageBackground>
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
  loadingContainer: {
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    justifyContent: "center",
    paddingVertical: 50,
    width: "100%"
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
