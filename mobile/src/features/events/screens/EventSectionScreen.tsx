import { useSelector } from "react-redux";

import { useCallback, useEffect, useRef, useState } from "react";

import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { Screen } from "@/components/views/screen/Screen";
import {
  AllStackParamList,
  EventsStackParamList
} from "@/features/app/navigationTypes";
import {
  getEventInfo,
  updateEventInDatabase
} from "@/services/firebase/firebaseEventFunctions";
import { updateEventLinkInDatabase } from "@/services/firebase/firebaseInviteFunctions";
import { UserState } from "@/store/UserSlice";
import { colors } from "@/styles/colors";
import type { Event } from "@/types/Event";
import { parseDatabaseDate } from "@/utils/date";
import { AppError } from "@/utils/error";
import { log } from "@/utils/logging";
import { updateNotificationsForEvent } from "@/utils/notifications";

import { EventDetailsEdit } from "../components/edit/EventDetailsEdit";
import { EventItineraryEdit } from "../components/edit/EventItineraryEdit";
import { EventLocationEdit } from "../components/edit/EventLocationEdit";
import { EventMusicEdit } from "../components/edit/EventMusicEdit";
import { EventTimelineEdit } from "../components/edit/EventTimelineEdit";
import { EventToDoShoppingEdit } from "../components/edit/EventToDoShoppingEdit";
import { EventEssentialsEdit } from "../components/essentials/EventEssentialsEdit";
import { EventInvitesRSVPEdit } from "../components/guest-list/EventInvitesRSVPEdit";

interface EventSectionScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<EventsStackParamList, "EventEditSection">;
}

export function EventSectionScreen({
  navigation,
  route
}: EventSectionScreenProps) {
  const [originalEvent, setOriginalEvent] = useState(route.params.event);
  const [event, setEvent] = useState(route.params.event);
  const section = route.params.section;
  const eventId = route.params.event.id ?? "";
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userId = useSelector((state: UserState) => state.uid);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        const eventData = await getEventInfo({ id: eventId } as Event);
        if (cancelled) return;
        if (eventData) {
          setEvent(eventData);
        } else {
          new AppError(
            new Error("Event not found"),
            "Error fetching event",
            true
          );
        }
      }

      load();
      return () => {
        cancelled = true;
      };
    }, [eventId])
  );

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      if (JSON.stringify(event) === JSON.stringify(originalEvent)) {
        log("Event has not changed", "info");
        return;
      }

      await updateEventInDatabase(event);
      setOriginalEvent(event);

      if (event.eventLinkEnabled) {
        await updateEventLinkInDatabase(event);
      }

      if (
        parseDatabaseDate(event.date).getTime() !==
        parseDatabaseDate(originalEvent?.date).getTime()
      ) {
        await updateNotificationsForEvent(event);
      }
    }, 250);
  }, [event, userId]);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  function getBackgroundColor() {
    if (section === "Details") return colors.primary;
    if (section === "Essentials") return colors.primaryTint;
    if (section === "Location") return colors.primary;
    if (section === "To Do") return colors.gray;
    if (section === "Music") return colors.secondary;
    if (section === "Timeline") return colors.primaryTint2;
    if (section === "Invites") return colors.darkGray;
    if (section === "Itinerary") return colors.primary;
  }

  function getIcon() {
    if (section === "Details") return "edit";
    if (section === "Location") return "map-marker-alt";
    if (section === "Essentials") return "file";
    if (section === "To Do") return "bars";
    if (section === "Music") return "play-circle";
    if (section === "Timeline") return "clock";
    if (section === "Invites") return "envelope";
    if (section === "Itinerary") return "calendar";
  }

  return (
    <Screen
      headerConfig={{
        type: "flat",
        flatHeaderProps: {
          title: section,
          backgroundColor: getBackgroundColor(),
          dark: true,
          backAction: true,
          icon: getIcon()
        },
        backgroundColor: getBackgroundColor()
      }}
      contentConfig={{
        tabBarPresent: true,
        backgroundColor: getBackgroundColor()
      }}
    >
      {section === "Details" && (
        <EventDetailsEdit event={event} setEvent={setEvent} />
      )}

      {section === "Essentials" && (
        <EventEssentialsEdit event={event} setEvent={setEvent} />
      )}

      {section === "Location" && (
        <EventLocationEdit event={event} setEvent={setEvent} />
      )}

      {section === "To Do" && (
        <EventToDoShoppingEdit event={event} setEvent={setEvent} />
      )}

      {section === "Timeline" && (
        <EventTimelineEdit event={event} setEvent={setEvent} />
      )}

      {section === "Invites" && (
        <EventInvitesRSVPEdit event={event} setEvent={setEvent} />
      )}

      {section === "Music" && (
        <EventMusicEdit event={event} setEvent={setEvent} />
      )}

      {section === "Itinerary" && (
        <EventItineraryEdit event={event} setEvent={setEvent} />
      )}
    </Screen>
  );
}
