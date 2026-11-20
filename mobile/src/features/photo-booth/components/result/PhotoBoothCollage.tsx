import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

import { PhotoBoothColumnCollage } from "./PhotoBoothColumnCollage";
import { PhotoBoothGridCollage } from "./PhotoBoothGridCollage";
import { PhotoBoothRowCollage } from "./PhotoBoothRowCollage";
import { PhotoBoothSingleCollage } from "./PhotoBoothSingleCollage";

type PhotoBoothCollageProps = {
  filter: string;
  onPhotoPress?: (index: number) => void;
  preview?: boolean;
};

export function PhotoBoothCollage({
  filter,
  onPhotoPress,
  preview = false
}: PhotoBoothCollageProps) {
  const { collageStyle } = usePhotoBoothSettings();

  if (collageStyle === "single") {
    return (
      <PhotoBoothSingleCollage
        filter={filter}
        onPhotoPress={onPhotoPress}
        preview={preview}
      />
    );
  }

  if (collageStyle === "row") {
    return (
      <PhotoBoothRowCollage
        filter={filter}
        onPhotoPress={onPhotoPress}
        preview={preview}
      />
    );
  }

  if (collageStyle === "column") {
    return (
      <PhotoBoothColumnCollage
        filter={filter}
        onPhotoPress={onPhotoPress}
        preview={preview}
      />
    );
  }

  if (collageStyle === "square") {
    return (
      <PhotoBoothGridCollage
        filter={filter}
        onPhotoPress={onPhotoPress}
        preview={preview}
      />
    );
  }

  return null;
}
