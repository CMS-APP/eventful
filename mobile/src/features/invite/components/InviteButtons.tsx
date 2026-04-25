import { useCallback, useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { Button } from "@/components/buttons/Button";
import { EventInviteStackParamList } from "@/features/app/navigationTypes";
import { getEventInvites } from "@/services/firebase/firebaseInviteFunctions";
import { colors } from "@/styles/colors";
import { Event } from "@/types/Event";
import { Invite } from "@/types/Invite";
import { User } from "@/types/User";

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
    const invites = await getEventInvites(event);
    setGuestCount(invites.length);
  }, [event]);

  const getActivityCount = useCallback(() => {
    return event.itinerary?.length || 0;
  }, [event]);

  const getPlaylistCount = useCallback(() => {
    return event.playlists?.length || 0;
  }, [event]);

  useEffect(() => {
    getGuestCount();
  }, [getGuestCount]);

  return (
    <View style={styles.container}>
      <Button
        text="Guests"
        subText={`Invited: ${guestCount}`}
        icon="user"
        color={colors.primary}
        textColor={colors.white}
        onPress={() =>
          navigation.navigate("EventInviteGuests", { invite, event, host })
        }
      />

      <Button
        text="Itinerary"
        subText={`Activities: ${getActivityCount()}`}
        icon="calendar"
        color={colors.primary}
        textColor={colors.white}
        onPress={() =>
          navigation.navigate("EventInviteItinerary", { invite, event, host })
        }
      />

      <Button
        text="Music"
        subText={`Playlists: ${getPlaylistCount()}`}
        icon="play-circle"
        color={colors.primary}
        textColor={colors.white}
        onPress={() =>
          navigation.navigate("EventInviteMusic", { invite, event, host })
        }
      />

      <Button
        text="Food & Drink"
        subText="Optional dietary requirements"
        icon="coffee"
        color={colors.primary}
        textColor={colors.white}
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
