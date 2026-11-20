import { StyleSheet, View } from "react-native";

import { usePhotoBoothCamera } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

import { PhotoBoothText } from "./PhotoBoothText";
import { ResultImage } from "./ResultImage";
import { COLLAGE_BASE_WIDTH } from "./collageScale";
import { previewPlaceholderPhoto } from "./previewPlaceholderPhoto";

type PhotoBoothSingleCollageProps = {
  filter: string;
  onPhotoPress?: (index: number) => void;
  preview?: boolean;
};

export function PhotoBoothSingleCollage({
  filter,
  onPhotoPress = () => {},
  preview = false
}: PhotoBoothSingleCollageProps) {
  const width = COLLAGE_BASE_WIDTH;
  const padding = 12;

  const totalWidth = width / 1.5 - padding;
  const imageWidth = totalWidth - padding * 2;
  const imageHeight = imageWidth;

  const { photos } = usePhotoBoothCamera();
  const { frameColor, flipPhotosHorizontally } = usePhotoBoothSettings();

  const photo = preview ? previewPlaceholderPhoto(0) : photos[0];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.photoView,
          { backgroundColor: frameColor, padding, width: totalWidth }
        ]}
      >
        {photo && (
          <ResultImage
            filter={filter}
            key={`slot-0-${photo.uri}`}
            photo={photo}
            preview={preview}
            flipped={flipPhotosHorizontally}
            width={imageWidth}
            height={imageHeight}
            onPhotoPress={onPhotoPress}
            index={0}
          />
        )}

        <PhotoBoothText collage={"single"} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center"
  },
  photoView: {
    alignItems: "center"
  }
});
