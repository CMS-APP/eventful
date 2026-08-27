import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { StyleSheet, View } from "react-native";

import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";

import { Screen } from "@/components/screen/Screen";
import { colors } from "@/design-system/tokens/colors";
import { getEvent } from "@/services/photo-booth/events";
import { UserState } from "@/store/UserSlice";
import { GalleryEvent, GalleryPhoto } from "@/types/photoBoothGallery";

import { GalleryPhotoItem } from "../components/gallery/GalleryPhotoItem";
import { UploadProgress } from "../components/gallery/UploadProgress";
import {
  PhotoBoothStackNavigation,
  PhotoBoothStackParamList
} from "../photoBoothStackParams";

export function PhotoBoothEventGallery() {
  const { event: initialEvent, type } =
    useRoute<RouteProp<PhotoBoothStackParamList, "PhotoBoothEventGallery">>()
      .params;
  const userId = useSelector((state: UserState) => state.uid);
  const navigation = useNavigation<PhotoBoothStackNavigation>();

  const [event, setEvent] = useState<GalleryEvent>(initialEvent);

  const refreshEvent = useCallback(
    async (event: GalleryEvent) => {
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
    }, [refreshEvent])
  );

  return (
    <Screen
      contentConfig={{ tabBarPresent: false }}
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
        {type !== "cloud" && (
          <UploadProgress event={event} refreshEvent={refreshEvent} />
        )}

        {event.photos.map((photo) => (
          <GalleryPhotoItem
            key={photo.photoId}
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
