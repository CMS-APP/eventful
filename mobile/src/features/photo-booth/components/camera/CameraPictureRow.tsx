import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Image, StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";

import { usePhotoBoothCamera } from "../../provider/PhotoBoothCameraProvider";

const THUMB_WIDTH = 80;
const FALLBACK_RATIO = 7 / 10;

export function CameraPictureRow() {
  const { photos } = usePhotoBoothCamera();
  const { top } = useSafeAreaInsets();

  if (photos.length === 0) return null;

  return (
    <View style={[styles.scroll, { top }]}>
      {photos.map((photo, index) => {
        const photoHeight = THUMB_WIDTH / FALLBACK_RATIO;
        return (
          <View key={`${photo.uri}-${index}`} style={styles.thumbWrap}>
            <Image
              source={{ uri: photo.uri }}
              style={{
                width: THUMB_WIDTH,
                height: photoHeight,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.white
              }}
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
  thumbWrap: {
    flexShrink: 0
  }
});
