import { getAuth } from "@react-native-firebase/auth";

import { useCallback, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { padding } from "@/design-system/tokens/padding";
import { EventGuest, getEventGuestList } from "@/services/firebase/backend";
import { Event } from "@/types/Event";
import { log } from "@/utils/logging";

interface EventGuestListProps {
  event: Event;
}

const RESPONSE_COLORS: Record<EventGuest["response"], string> = {
  accept: colors.primary,
  maybe: colors.secondary,
  decline: colors.tertiary
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function EventGuestList({ event }: EventGuestListProps) {
  const [guests, setGuests] = useState<EventGuest[]>([]);

  const fetchData = useCallback(async () => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) return;

    try {
      const guests = await getEventGuestList(event.id, currentUser);
      setGuests(guests);
    } catch (error) {
      log(`Error fetching guest list: ${error}`, "error");
    }
  }, [event.id]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  return (
    <View style={styles.container}>
      <Text type="subHeader" color={colors.black}>
        Invited Guests:
      </Text>

      {guests.length === 0 && (
        <EmptyStateContainer
          title="No other guests"
          description="No other guests have been invited to this event"
          icon="users"
        />
      )}

      {guests.map((guest, index) => (
        <View key={`${guest.name}-${index}`} style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.initial}>{getInitials(guest.name)}</Text>
          </View>
          <Text type="body" style={styles.name}>
            {guest.name}
          </Text>
          <View
            style={[
              styles.pill,
              { backgroundColor: RESPONSE_COLORS[guest.response] }
            ]}
          >
            <Text type="body" color="white" style={styles.pillText}>
              {guest.response}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: colors.primaryTint,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  container: {
    gap: 12
  },
  initial: {
    color: colors.white,
    textAlign: "center"
  },
  name: {
    flex: 1
  },
  pill: {
    ...card.small,
    ...padding.smallWidget
  },
  pillText: {
    textAlign: "right"
  },
  row: {
    ...card.small,
    ...padding.mediumWidget,
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  }
});
