import { useCallback, useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { EventInviteStackParamList } from "@/app/navigation";
import { Button } from "@/design-system/components/Button";
import { colors } from "@/design-system/tokens/colors";
import { getEventInvites } from "@/services/firebase/firebaseInviteFunctions";
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
        text={"Guests: " + guestCount}
        leadingIcon="user"
        color={colors.primary}
        textColor={colors.white}
        onPress={() =>
          navigation.navigate("EventInviteGuests", { invite, event, host })
        }
      />

      <Button
        text={"Activities: " + getActivityCount()}
        leadingIcon="calendar"
        color={colors.primary}
        textColor={colors.white}
        onPress={() =>
          navigation.navigate("EventInviteItinerary", { invite, event, host })
        }
      />

      <Button
        text={"Music: " + getPlaylistCount()}
        leadingIcon="play-circle"
        color={colors.primary}
        textColor={colors.white}
        onPress={() =>
          navigation.navigate("EventInviteMusic", { invite, event, host })
        }
      />

      <Button
        text="Food & Drink"
        leadingIcon="coffee"
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
