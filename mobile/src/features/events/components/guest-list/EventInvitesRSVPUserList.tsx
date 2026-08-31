import { ActivityIndicator } from "react-native-paper";

import { useCallback } from "react";

import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";
import { updateEventInDatabase } from "@/services/firebase/event";
import { Event } from "@/types/Event";
import { UserInvite } from "@/types/UserInvite";

import { EventInviteUserItem } from "./EventInviteUserItem";

interface EventInvitesRSVPUserListProps {
  event: Event;
  setEvent: (event: Event) => void;
  userList: UserInvite[];
  fetchingData: boolean;
  fetchData: () => void;
}

export type SetResponseManual = (
  user: UserInvite,
  response: string
) => Promise<void>;
export type DeleteGuestManual = (user: UserInvite) => Promise<void>;

export function EventInvitesRSVPUserList({
  event,
  setEvent,
  userList,
  fetchingData,
  fetchData
}: EventInvitesRSVPUserListProps) {
  const setResponseManual = useCallback(
    async (user: UserInvite, response: string) => {
      const guestList = (event.guestList || []).map((guest) =>
        guest.id === user.user.uid ? { ...guest, response } : guest
      );
      const updatedEvent = { ...event, guestList };
      setEvent(updatedEvent);
      await updateEventInDatabase({ id: event.id, guestList });
    },
    [event, setEvent]
  );

  const deleteGuestManual = useCallback(
    async (user: UserInvite) => {
      const guestList = (event.guestList || []).filter(
        (guest) => guest.id !== user.user.uid
      );
      setEvent({ ...event, guestList });
      await updateEventInDatabase({ id: event.id, guestList });
    },
    [event, setEvent]
  );

  return (
    <View style={styles.container}>
      {fetchingData && (
        <ActivityIndicator
          size={"large"}
          color={colors.secondary}
          style={styles.loadingIndicator}
        />
      )}

      {!fetchingData && (
        <View style={styles.usersList}>
          {userList.map((user, index) => {
            return (
              <EventInviteUserItem
                key={user.user.uid}
                user={user.user}
                event={event}
                invite={user.invite}
                refreshUsers={fetchData}
                setResponseManual={setResponseManual}
                deleteGuestManual={deleteGuestManual}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15
  },
  loadingIndicator: {
    marginTop: 20
  },
  usersList: {
    gap: 12,
    marginTop: 12
  }
});
