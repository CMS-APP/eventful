import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { getEvents } from "@/services/photo-booth/events";
import { UserState } from "@/store/UserSlice";
import { GalleryEvent } from "@/types/photoBoothGallery";
import { log } from "@/utils/logging";
import { isValidUserId } from "@/utils/userId";

import { GalleryEventListItem } from "./GalleryEventListItem";

export function GalleryEventList() {
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const userId = useSelector((state: UserState) => state.uid);

  const getAllEvents = useCallback(async () => {
    if (!isValidUserId(userId)) return;

    try {
      const events = await getEvents(userId);
      setEvents(events);
    } catch {
      log("Error Getting Events: ", "error");
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      getAllEvents();
    }, [getAllEvents])
  );

  return (
    <View style={styles.container}>
      {events.length > 0 ? (
        <>
          {events.map((event) => (
            <GalleryEventListItem key={event.eventTitle} event={event} />
          ))}
        </>
      ) : (
        <EmptyStateContainer
          title="No Past Events"
          description="Take some photos to save photos to the cloud"
          icon="camera"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12
  }
});
