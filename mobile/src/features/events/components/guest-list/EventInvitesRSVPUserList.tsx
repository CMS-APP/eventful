import { ActivityIndicator } from "react-native-paper";

import { useCallback } from "react";

import { StyleSheet, View } from "react-native";

import { colors } from "@/styles/colors";
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

export function EventInvitesRSVPUserList({
  event,
  setEvent,
  userList,
  fetchingData,
  fetchData
}: EventInvitesRSVPUserListProps) {
  const setResponseManual = useCallback(
    (user: UserInvite, response: string) => {
      const guestList = event.guestList || [];
      const guest = guestList.find((guest) => guest.id === user.user.uid);
      if (guest) {
        guest.response = response;
      }
      setEvent({ ...event, guestList: guestList });
    },
    [event, setEvent]
  );

  const deleteGuestManual = useCallback(
    (user: UserInvite) => {
      const guestList = event.guestList || [];
      const newGuestList = guestList.filter(
        (guest) => guest.id !== user.user.uid
      );
      setEvent({ ...event, guestList: newGuestList });
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
