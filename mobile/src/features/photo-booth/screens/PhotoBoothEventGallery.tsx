import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { StyleSheet, View } from "react-native";

import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";

import {
  PhotoBoothStackNavigation,
  PhotoBoothStackParamList
} from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { colors } from "@/design-system/tokens/colors";
import { getEvent } from "@/services/photo-booth/events";
import { UserState } from "@/store/UserSlice";
import { GalleryEvent, GalleryPhoto } from "@/types/photoBoothGallery";
import { isValidUserId } from "@/utils/userId";

import { GalleryPhotoItem } from "../components/gallery/GalleryPhotoItem";
import { UploadProgress } from "../components/gallery/UploadProgress";

export function PhotoBoothEventGallery() {
  const { event: initialEvent } =
    useRoute<RouteProp<PhotoBoothStackParamList, "PhotoBoothEventGallery">>()
      .params;
  const userId = useSelector((state: UserState) => state.uid);
  const navigation = useNavigation<PhotoBoothStackNavigation>();

  const [event, setEvent] = useState<GalleryEvent>(initialEvent);

  const refreshEvent = useCallback(
    async (event: GalleryEvent) => {
      if (!isValidUserId(userId)) return;

      const newEvent = await getEvent(userId, event.eventTitle);
      if (!newEvent) {
        return;
      }
      setEvent(newEvent);
    },
    [userId]
  );

  const handlePhotoPress = useCallback(
    (photo: GalleryPhoto) => {
      navigation.navigate("PhotoBoothPhoto", { photo });
    },
    [navigation]
  );

  useFocusEffect(
    useCallback(() => {
      void refreshEvent(event);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshEvent])
  );

  return (
    <Screen
      contentConfig={{ tabBarPresent: true }}
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Photo Booth",
          subTitle: event.eventTitle,
          icon: "folder",
          color: colors.white,
          accountButton: false,
          backgroundColor: colors.primary,
          backAction: true
        }
      }}
    >
      <View style={styles.container}>
        <UploadProgress event={event} refreshEvent={refreshEvent} />

        {event.photos.map((photo) => (
          <GalleryPhotoItem
            key={photo.storageId ?? photo.photoId}
            photo={photo}
            onPhotoPress={handlePhotoPress}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 52
  }
});
