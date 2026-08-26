import { StyleSheet, View } from "react-native";

import { useAppDimensions } from "@/design-system/tokens/globalStyles";

import { usePhotoBoothCamera } from "../../provider/PhotoBoothCameraProvider";
import { usePhotoBoothSettings } from "../../provider/PhotoBoothSettingsProvider";
import { PhotoBoothText } from "./PhotoBoothText";
import { ResultImage } from "./ResultImage";
import { previewPlaceholderPhoto } from "./previewPlaceholderPhoto";

type PhotoBoothColumnCollageProps = {
  filter: string;
  onPhotoPress?: (index: number) => void;
  preview?: boolean;
};

export function PhotoBoothColumnCollage({
  filter,
  onPhotoPress = () => {},
  preview = false
}: PhotoBoothColumnCollageProps) {
  const width = useAppDimensions().screenWidth;

  const padding = 24;
  const imageWidth = width - padding;
  const imageHeight = imageWidth / (7 / 10);
  const totalWidth = imageWidth / 4 + padding / 2;

  const { photos } = usePhotoBoothCamera();
  const { frameColor, flipPhotosHorizontally } = usePhotoBoothSettings();

  const columnPhotos = preview
    ? [0, 1, 2].map((slot) => previewPlaceholderPhoto(slot))
    : photos.slice(0, 3);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.photoView,
          styles.photoViewColumn,
          { backgroundColor: frameColor, width: totalWidth }
        ]}
      >
        {columnPhotos.map((photo, slot) => (
          <ResultImage
            filter={filter}
            key={`slot-${slot}-${photo.uri}`}
            photo={photo}
            preview={preview}
            flipped={flipPhotosHorizontally}
            width={imageWidth / 4}
            height={imageHeight / 4}
            onPhotoPress={onPhotoPress}
            index={slot}
          />
        ))}

        <PhotoBoothText collage={"column"} />
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
  photoViewColumn: {
    alignItems: "center",
    gap: 6,
    padding: 6
  }
});
