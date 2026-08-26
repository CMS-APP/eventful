import { StyleSheet, View } from "react-native";

import { useAppDimensions } from "@/design-system/tokens/globalStyles";

import { usePhotoBoothCamera } from "../../provider/PhotoBoothCameraProvider";
import { usePhotoBoothSettings } from "../../provider/PhotoBoothSettingsProvider";
import { PhotoBoothText } from "./PhotoBoothText";
import { ResultImage } from "./ResultImage";
import { previewPlaceholderPhoto } from "./previewPlaceholderPhoto";

type PhotoBoothGridCollageProps = {
  filter: string;
  onPhotoPress?: (index: number) => void;
  preview?: boolean;
};

export function PhotoBoothGridCollage({
  filter,
  onPhotoPress = () => {},
  preview = false
}: PhotoBoothGridCollageProps) {
  const width = useAppDimensions().screenWidth;
  const gap = 12;

  const totalWidth = width / 1.5 - gap;
  const imageWidth = (totalWidth - gap) / 2 - gap;
  const imageHeight = imageWidth / (7 / 10);

  const { photos } = usePhotoBoothCamera();
  const { frameColor, flipPhotosHorizontally } = usePhotoBoothSettings();

  const topRow = preview
    ? [0, 1].map((slot) => previewPlaceholderPhoto(slot))
    : photos.slice(0, 2);
  const bottomRow = preview
    ? [2, 3].map((slot) => previewPlaceholderPhoto(slot))
    : photos.slice(2, 4);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.photoView,
          { backgroundColor: frameColor, width: totalWidth }
        ]}
      >
        <View style={[styles.photosGridRow, { gap, marginBottom: gap }]}>
          {topRow.map((photo, slot) => (
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

        <View style={[styles.photosGridRow, { gap }]}>
          {bottomRow.map((photo, slot) => (
            <ResultImage
              filter={filter}
              key={`slot-${slot + 2}-${photo.uri}`}
              photo={photo}
              preview={preview}
              flipped={flipPhotosHorizontally}
              width={imageWidth}
              height={imageHeight}
              onPhotoPress={onPhotoPress}
              index={slot + 2}
            />
          ))}
        </View>

        <PhotoBoothText collage={"grid"} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center"
  },
  photoView: {
    alignItems: "center",
    padding: 12
  },
  photosGridRow: {
    flexDirection: "row"
  }
});
