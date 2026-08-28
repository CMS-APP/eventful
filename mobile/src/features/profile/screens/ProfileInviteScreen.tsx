import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { StyleSheet, View } from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList, ProfileStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { colors } from "@/design-system/tokens/colors";
import { InviteEventCard } from "@/features/invite/components/InviteEventCard";
import { getFutureEventsFromDatabase } from "@/services/firebase/event";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";

interface ProfileInviteScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<ProfileStackParamList, "ProfileInvite">;
}

export function ProfileInviteScreen({
  navigation,
  route
}: ProfileInviteScreenProps) {
  const userId = useSelector((state: UserState) => state.uid);
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = route.params;

  const fetchEvents = useCallback(async () => {
    const events = await getFutureEventsFromDatabase(userId);
    setEvents(events);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Invite To Event",
          subTitle: user.name,
          color: colors.white,
          backgroundColor: colors.primary,
          icon: "inbox",
          backAction: true
        },
        backgroundColor: colors.primary
      }}
      contentConfig={{
        tabBarPresent: true
      }}
    >
      <View style={styles.container}>
        {events.length === 0 && (
          <EmptyStateContainer
            title="No Events Found"
            description="Create a new event to invite people to"
            icon="calendar"
          />
        )}

        {events.length > 0 &&
          events.map((event) => (
            <InviteEventCard key={event.id} event={event} user={user} />
          ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 52,
    paddingHorizontal: 16
  }
});
