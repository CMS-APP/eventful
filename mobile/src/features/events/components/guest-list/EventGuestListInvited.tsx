import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { Text } from "@/design-system/components/Text";
import { getInvitedGuests } from "@/services/firebase/firebaseInviteFunctions";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { User } from "@/types/User";
import { UserInvite } from "@/types/UserInvite";

import { EventGuestListInvitedItem } from "./EventGuestListInvitedItem";

interface EventGuestListInvitedProps {
  event: Event;
  host: User;
}

export function EventGuestListInvited({
  event,
  host
}: EventGuestListInvitedProps) {
  const [invitedGuests, setInvitedGuests] = useState<UserInvite[]>([]);
  const userId = useSelector((state: UserState) => state.uid);

  const fetchData = useCallback(async () => {
    const invitedGuests = await getInvitedGuests(event, userId);
    setInvitedGuests(invitedGuests as UserInvite[]);
  }, [event, userId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  return (
    <View style={styles.container}>
      {host && (
        <>
          <Text type="subHeader" color="white">
            Host:
          </Text>

          <EventGuestListInvitedItem
            key={host.uid}
            user={host}
            invite={{
              id: host.uid,
              recipient: host.uid,
              sender: host.uid,
              eventId: event.id,
              response: "accept",
              dietary: ""
            }}
            event={event}
          />
        </>
      )}

      <Text type="subHeader" color="white">
        Invited Guests:
      </Text>

      {invitedGuests.length === 0 && (
        <EmptyStateContainer
          title="No other guests"
          description="No other guests have been invited to this event"
          icon="users"
        />
      )}

      {invitedGuests.length !== 0 &&
        invitedGuests.map((item, index) => (
          <EventGuestListInvitedItem
            key={item.invite.id}
            user={item.user}
            invite={item.invite}
            event={event}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 12
  }
});
