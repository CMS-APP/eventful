import { ActivityIndicator } from "react-native-paper";

import { useCallback } from "react";

import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";
import { Event } from "@/types/Event";
import { UserInvite } from "@/types/UserInvite";

import { EventInviteUserItem } from "./EventInviteUserItem";

interface EventInvitesRSVPUserListProps {
  event: Event;
  setEvent: (event: Event) => void;
  saveNow: (updater: Event | ((prev: Event) => Event)) => Promise<void>;
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
  saveNow,
  userList,
  fetchingData,
  fetchData
}: EventInvitesRSVPUserListProps) {
  const setResponseManual = useCallback(
    async (user: UserInvite, response: string) => {
      const guestList = (event.guestList || []).map((guest) =>
        guest.id === user.user.uid ? { ...guest, response } : guest
      );
      await saveNow({ ...event, guestList });
    },
    [event, saveNow]
  );

  const deleteGuestManual = useCallback(
    async (user: UserInvite) => {
      const guestList = (event.guestList || []).filter(
        (guest) => guest.id !== user.user.uid
      );
      await saveNow({ ...event, guestList });
    },
    [event, saveNow]
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
    paddingHorizontal: 16
  },
  loadingIndicator: {
    marginTop: 20
  },
  usersList: {
    gap: 12,
    marginTop: 12
  }
});
