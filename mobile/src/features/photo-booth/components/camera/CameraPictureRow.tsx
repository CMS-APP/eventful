import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Image, StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";
import { usePhotoBoothCamera } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";

const THUMB_WIDTH = 80;
const FALLBACK_RATIO = 0.7;
const HEIGHT = THUMB_WIDTH / FALLBACK_RATIO;

export function CameraPictureRow() {
  const { photos } = usePhotoBoothCamera();
  const { top } = useSafeAreaInsets();

  if (photos.length === 0) return null;

  return (
    <View style={[styles.scroll, { top }]}>
      {photos.map((photo, index) => {
        return (
          <View key={`${photo.uri}-${index}`} style={styles.thumbWrap}>
            <Image
              source={{ uri: photo.uri }}
              style={styles.thumb}
              resizeMode="cover"
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexDirection: "row",
    gap: 12,
    left: 0,
    paddingHorizontal: 12,
    position: "absolute",
    right: 0,
    top: 0
  },
  thumb: {
    borderColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    height: HEIGHT,
    width: THUMB_WIDTH
  },
  thumbWrap: {
    flexShrink: 0
  }
});
