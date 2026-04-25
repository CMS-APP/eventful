import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { Text } from "@/components/text/Text";
import { getEvents } from "@/services/photo-booth/events";
import { UserState } from "@/store/UserSlice";
import { GalleryEvent } from "@/types/photoBoothGallery";
import { AppError } from "@/utils/error";

import { GalleryEventListItem } from "./GalleryEventListItem";

export function GalleryEventList() {
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const userId = useSelector((state: UserState) => state.uid);

  const getAllEvents = useCallback(async () => {
    try {
      const events = await getEvents(userId!);
      setEvents(events);
    } catch (error) {
      new AppError(error, "Error getting local events");
    }
  }, []);

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
        <>
          <Text type="header" center>
            No Past Events
          </Text>
          <Text type="subHeader" center>
            Take some photos to save photos to the cloud
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12
  }
});
