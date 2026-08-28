import { useCallback } from "react";

import { StyleSheet, View } from "react-native";

import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { Button } from "@/design-system/components/buttons/Button";
import { colors } from "@/design-system/tokens/colors";
import { Event } from "@/types/Event";

import { EventsListItem } from "./EventsListItem";

interface EventsListProps {
  upcomingEvents: Event[];
  selectedButton: string;
  pastEvents: Event[];
  newEventAction: () => void;
  declineEvents: Event[];
}

export function EventsList({
  upcomingEvents,
  selectedButton,
  pastEvents,
  newEventAction,
  declineEvents
}: EventsListProps) {
  const renderEventList = useCallback(
    (events: Event[], isUpcoming: boolean, isDecline: boolean) => {
      return (
        <View style={styles.container}>
          {events.length > 0 ? (
            <View style={styles.listContainer}>
              {events.map((event, index) => (
                <EventsListItem
                  key={event.id}
                  index={index}
                  event={event}
                  isUpcoming={isUpcoming}
                  isDecline={isDecline}
                />
              ))}
            </View>
          ) : (
            <>
              <EmptyStateContainer
                title="No Events Found"
                description="Create a new event by using the button below"
                icon="calendar-plus"
              />
              <Button
                text="New Event"
                onPress={newEventAction}
                color={colors.primary}
                textColor={colors.white}
                leadingIcon="calendar-plus"
              />
            </>
          )}
        </View>
      );
    },
    [newEventAction]
  );

  return (
    <View>
      {selectedButton === "Upcoming" &&
        renderEventList(upcomingEvents, true, false)}
      {selectedButton === "Past" && renderEventList(pastEvents, false, false)}
      {selectedButton === "Declined" &&
        renderEventList(declineEvents, false, true)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginHorizontal: 24,
    marginTop: 12
  },
  listContainer: {
    gap: 12
  }
});
