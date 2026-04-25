import { useCallback } from "react";

import { StyleSheet, View } from "react-native";

import { Button } from "@/components/buttons/Button";
import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { colors } from "@/styles/colors";
import { Event } from "@/types/Event";

import { EventsListItem } from "./EventsListItem";

interface EventsListProps {
  upcomingEvents: Event[];
  selectedButton: string;
  pastEvents: Event[];
  newEventAction: () => void;
  declineEvents: Event[];
  viewType: string;
}

export function EventsList({
  upcomingEvents,
  selectedButton,
  pastEvents,
  newEventAction,
  declineEvents,
  viewType
}: EventsListProps) {
  const renderEventList = useCallback(
    (events: Event[], isUpcoming: boolean, isDecline: boolean) => {
      return (
        <View style={styles.container}>
          {events.length > 0 ? (
            viewType === "Grid" ? (
              <View style={styles.gridContainer}>
                {events.map((event, index) => (
                  <View key={event.id} style={styles.gridItem}>
                    <EventsListItem
                      index={index}
                      event={event}
                      isUpcoming={isUpcoming}
                      isDecline={isDecline}
                      isGrid={true}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.listContainer}>
                {events.map((event, index) => (
                  <EventsListItem
                    key={event.id}
                    index={index}
                    event={event}
                    isUpcoming={isUpcoming}
                    isDecline={isDecline}
                    isGrid={false}
                  />
                ))}
              </View>
            )
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
                icon="calendar-plus"
              />
            </>
          )}
        </View>
      );
    },
    [viewType, selectedButton, newEventAction]
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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between"
  },
  gridItem: {
    aspectRatio: 1,
    width: "48%"
  },
  listContainer: {
    gap: 12
  }
});
