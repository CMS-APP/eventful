import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { ArcCutout } from "@/components/views/ArcCutout";
import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { InviteEventCard } from "@/features/invite/components/InviteEventCard";
import { getFutureEventsFromDatabaseByIds } from "@/services/firebase/event";
import { getInvitesFromUser } from "@/services/firebase/invite";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { Invite } from "@/types/Invite";
import { User } from "@/types/User";
import { isValidUserId } from "@/utils/userId";

interface ProfileInvitesProps {
  user: User;
}

export function ProfileInvites({ user }: ProfileInvitesProps) {
  const userId = useSelector((state: UserState) => state.uid);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = useCallback(async () => {
    if (!isValidUserId(userId)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const invites = await getInvitesFromUser(userId, user.uid);
    const events = await getFutureEventsFromDatabaseByIds(
      invites.map((invite: Invite) => invite.eventId)
    );
    setEvents(events);
    setLoading(false);
  }, [userId, user.uid]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  return (
    <View style={styles.container}>
      <Text type="header" center>
        Invites
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.secondary} />
      ) : events.length > 0 ? (
        <>
          {events.map((event) => (
            <InviteEventCard key={event.id} event={event} user={user} />
          ))}
        </>
      ) : (
        <EmptyStateContainer
          title="No Invites Found"
          description="Ask your friends to invite you!"
          icon="calendar"
        />
      )}

      <View style={styles.arcCutout}>
        <ArcCutout color={colors.primary} rotation={270} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  arcCutout: {
    left: 40,
    position: "absolute",
    top: 0
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 24
  }
});
