import { StyleSheet, View } from "react-native";

import { useAppDimensions } from "@/app/hooks/useAppDimensions";
import { usePhotoBoothCamera } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

import { PhotoBoothText } from "./PhotoBoothText";
import { ResultImage } from "./ResultImage";
import { previewPlaceholderPhoto } from "./previewPlaceholderPhoto";

type PhotoBoothRowCollageProps = {
  filter: string;
  onPhotoPress?: (index: number) => void;
  preview?: boolean;
};

export function PhotoBoothRowCollage({
  filter,
  onPhotoPress = () => {},
  preview = false
}: PhotoBoothRowCollageProps) {
  const width = useAppDimensions().screenWidth;

  const { photos } = usePhotoBoothCamera();
  const { frameColor, flipPhotosHorizontally } = usePhotoBoothSettings();

  const rowPhotos = preview
    ? [0, 1, 2].map((slot) => previewPlaceholderPhoto(slot))
    : photos.slice(0, 3);

  const gap = 12;
  const marginHorizontal = 48;
  const totalWidth = width - marginHorizontal - gap * 2;
  const imageWidth = (totalWidth - gap) / 3 - gap;
  const imageHeight = imageWidth / (7 / 10);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.photoView,
          { backgroundColor: frameColor, width: totalWidth }
        ]}
      >
        <View style={[styles.photosGridRow, { gap }]}>
          {rowPhotos.map((photo, slot) => (
            <ResultImage
              filter={filter}
              key={`slot-${slot}-${photo.uri}`}
              photo={photo}
              preview={preview}
              flipped={flipPhotosHorizontally}
              width={imageWidth}
              height={imageHeight}
              onPhotoPress={onPhotoPress}
              index={slot}
            />
          ))}
        </View>
        <PhotoBoothText collage={"row"} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center"
  },
  photoView: {
    padding: 12
  },
  photosGridRow: {
    flexDirection: "row",
    justifyContent: "center"
  }
});
