import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/Text";
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
      <Text type="subHeader" style={styles.noEventsText}>
        {noEventsText}
        {"\n"}
        <Text type="body" style={styles.noEventsSubtext}>
          Ask your friends to invite you!
        </Text>
      </Text>
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
  eventsContainer: {
    gap: 12,
    marginHorizontal: 12,
    marginVertical: 12
  },
  noEventsSubtext: {
    marginTop: 12,
    textAlign: "center"
  },
  noEventsText: {
    marginTop: 12,
    textAlign: "center"
  }
});
