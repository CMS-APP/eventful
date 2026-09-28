import AsyncStorage from "@react-native-async-storage/async-storage";

import { getPhotosDataLocally } from "@/services/photo-booth/localPhotos";
import { GalleryPhoto } from "@/types/photoBoothGallery";
import { parseDatabaseDate } from "@/utils/date";

export async function convertPhotoDataToGalleryPhotoData(userId: string) {
  const photoData = await getPhotosDataLocally();

  const newPhotoData: GalleryPhoto[] = [];
  for (const photo of photoData) {
    if (photo.id) {
      newPhotoData.push({
        photoId: photo.id,
        eventTitle: photo.title,
        uri: photo.uri,
        userId: userId,
        createdAt: parseDatabaseDate(photo.date),
        type: "local"
      });
    } else {
      newPhotoData.push(photo);
    }
  }

  await AsyncStorage.setItem("photosData", JSON.stringify(newPhotoData));
}
