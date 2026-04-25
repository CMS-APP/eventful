import { useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { Text } from "@/components/text/Text";
import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { colors } from "@/styles/colors";
import { Event } from "@/types/Event";
import { parseDatabaseDate } from "@/utils/date";

import { EventItem } from "./EventItem";

interface EventsViewProps {
  allEvents: Event[];
  allInvitedEvents: Event[];
  currentMonth: number;
  currentYear: number;
}

export function EventsView({
  allEvents,
  allInvitedEvents,
  currentMonth,
  currentYear
}: EventsViewProps) {
  const [currentEvents, setCurrentEvents] = useState<Event[]>([]);

  useEffect(() => {
    function getCurrentEvents() {
      const filteredEvents = [...allEvents, ...allInvitedEvents].filter(
        (event: Event) => {
          const date = parseDatabaseDate(event.date);
          return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          );
        }
      );

      filteredEvents.sort((a, b) => {
        return parseDatabaseDate(a.date) - parseDatabaseDate(b.date);
      });

      setCurrentEvents(filteredEvents);
    }

    getCurrentEvents();
  }, [allEvents, allInvitedEvents, currentMonth, currentYear]);

  return (
    <View style={styles.container}>
      <Text type="header" style={styles.eventsHeaderText}>
        Events
      </Text>

      {currentEvents.length === 0 && (
        <EmptyStateContainer
          title="No Events Found"
          description="Create a new event in the Events screen"
          icon="calendar-plus"
        />
      )}
      <View style={styles.eventsList}>
        {currentEvents.map((event: Event, index: number) => (
          <EventItem key={event.id} index={index} event={event} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    gap: 12,
    marginTop: 12,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  eventsHeaderText: {
    color: colors.white,
    marginBottom: 12
  },
  eventsList: {
    gap: 12
  }
});
