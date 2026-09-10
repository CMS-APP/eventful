import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList, EventsStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { colors } from "@/design-system/tokens/colors";

import { EventDetailsEdit } from "../components/edit/EventDetailsEdit";
import { EventItineraryEdit } from "../components/edit/EventItineraryEdit";
import { EventLocationEdit } from "../components/edit/EventLocationEdit";
import { EventMusicEdit } from "../components/edit/EventMusicEdit";
import { EventTimelineEdit } from "../components/edit/EventTimelineEdit";
import { EventToDoShoppingEdit } from "../components/edit/EventToDoShoppingEdit";
import { EventEssentialsEdit } from "../components/essentials/EventEssentialsEdit";
import { EventInvitesRSVPEdit } from "../components/guest-list/EventInvitesRSVPEdit";
import { useEventEditor } from "../hooks/useEventEditor";

interface EventSectionScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<EventsStackParamList, "EventEditSection">;
}

export function EventSectionScreen({
  navigation,
  route
}: EventSectionScreenProps) {
  const { event, setEvent, saveNow } = useEventEditor(route.params.event);
  const section = route.params.section;

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
        <EventToDoShoppingEdit
          event={event}
          setEvent={setEvent}
          initialTab={route.params.initialTab}
        />
      )}

      {section === "Timeline" && (
        <EventTimelineEdit event={event} setEvent={setEvent} />
      )}

      {section === "Invites" && (
        <EventInvitesRSVPEdit
          event={event}
          setEvent={setEvent}
          saveNow={saveNow}
        />
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
