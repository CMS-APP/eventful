import { StyleSheet, View } from "react-native";

import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { InviteEventCard } from "@/features/invite/components/InviteEventCard";
import { Event } from "@/types/Event";

interface InvitesViewProps {
  selectedButton: string;
  upcomingEvents: Event[];
  pastEvents: Event[];
}

export function InvitesView({
  selectedButton,
  upcomingEvents,
  pastEvents
}: InvitesViewProps) {
  const renderEvents = (events: Event[], noEventsText: string, past = false) =>
    events.length > 0 ? (
      <View style={styles.eventsContainer}>
        {events.map((event) => (
          <InviteEventCard key={event.id} event={event} disabled={past} />
        ))}
      </View>
    ) : (
      <View style={styles.emptyStateContainer}>
        <EmptyStateContainer
          title="No Invites"
          description="Ask your friends to invite you!"
          icon="inbox"
        />
      </View>
    );

  return (
    <View>
      {selectedButton === "Upcoming" &&
        renderEvents(upcomingEvents, "No Upcoming Invites", false)}
      {selectedButton === "Past" &&
        renderEvents(pastEvents, "No Past Invites", true)}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyStateContainer: {
    marginHorizontal: 12,
    marginVertical: 12
  },
  eventsContainer: {
    gap: 12,
    marginHorizontal: 12,
    marginVertical: 12
  }
});
