import { getAuth } from "@react-native-firebase/auth";

import { useCallback, useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { EventInviteStackParamList } from "@/app/navigation";
import { getEventGuestList } from "@/services/firebase/backend";
import { Event } from "@/types/Event";
import { Invite } from "@/types/Invite";
import { User } from "@/types/User";
import { log } from "@/utils/logging";

import { InviteMenuRow } from "./InviteMenuRow";

export function InviteButtons({
  event,
  invite,
  host
}: {
  event: Event;
  invite: Invite;
  host: User;
}) {
  const [guestCount, setGuestCount] = useState(0);
  const navigation =
    useNavigation() as StackNavigationProp<EventInviteStackParamList>;

  const getGuestCount = useCallback(async () => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) return;

    try {
      const guests = await getEventGuestList(event.id, currentUser);
      setGuestCount(guests.length + 1);
    } catch (error) {
      log(`Error fetching guest count: ${error}`, "error");
    }
  }, [event]);

  const getActivityCount = useCallback(() => {
    return event.itinerary?.length || 0;
  }, [event]);

  const getPlaylistCount = useCallback(() => {
    return event.playlists?.length || 0;
  }, [event]);

  useEffect(() => {
    (async () => {
      await getGuestCount();
    })();
  }, [getGuestCount]);

  return (
    <View style={styles.container}>
      <InviteMenuRow
        text={"Attendees: " + guestCount}
        icon="user"
        onPress={() =>
          navigation.navigate("EventInviteGuests", { invite, event, host })
        }
      />

      <InviteMenuRow
        text={"Activities: " + getActivityCount()}
        icon="calendar"
        onPress={() =>
          navigation.navigate("EventInviteItinerary", { invite, event, host })
        }
      />

      <InviteMenuRow
        text={"Music: " + getPlaylistCount()}
        icon="play-circle"
        onPress={() =>
          navigation.navigate("EventInviteMusic", { invite, event, host })
        }
      />

      <InviteMenuRow
        text="Food & Drink"
        icon="coffee"
        onPress={() =>
          navigation.navigate("EventInviteDietary", { invite, event, host })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 12,
    marginTop: 20
  }
});
