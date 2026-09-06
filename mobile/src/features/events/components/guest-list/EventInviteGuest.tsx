import { ActivityIndicator } from "react-native-paper";

import { useCallback } from "react";

import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import {
  AllStackParamList,
  EventsStackParamList,
  MainStackParamList
} from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { Divider } from "@/design-system/components/layout/Divider";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { ContactsSearch } from "@/features/contacts/components/ContactsSearch";

import { useEventInviteFollowing } from "../../hooks/useEventInviteFollowing";
import { EventInviteGuestItem } from "./EventInviteGuestItem";

interface EventInviteGuestProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<EventsStackParamList, "EventInviteGuest">;
}

export function EventInviteGuest({ navigation, route }: EventInviteGuestProps) {
  const event = route.params.event;

  const { guests, loading, search, setSearch, refreshInvites } =
    useEventInviteFollowing(event);

  const handleIconRightAction = useCallback(() => {
    (navigation as StackNavigationProp<MainStackParamList>).navigate(
      "Contacts",
      {
        screen: "ContactSearch",
        params: { open: true }
      }
    );
  }, [navigation]);

  return (
    <Screen
      headerConfig={{
        type: "flat",
        flatHeaderProps: {
          title: "Invite Guests",
          backgroundColor: colors.darkGray,
          dark: true,
          backAction: true,
          iconRight: "search",
          iconRightAction: handleIconRightAction
        },
        backgroundColor: colors.darkGray
      }}
      contentConfig={{
        backgroundColor: colors.darkGray
      }}
    >
      <View style={styles.container}>
        <ContactsSearch
          search={search}
          setSearch={setSearch}
          showSeparator={false}
        />

        <Divider />

        <View style={styles.contentContainer}>
          {loading && (
            <ActivityIndicator
              size="large"
              color={colors.secondary}
              style={styles.loader}
            />
          )}

          {!loading && guests.length === 0 && search.trim() !== "" && (
            <View style={styles.noResultsContainer}>
              <FontAwesome5 name="search" size={24} color={colors.white} />
              <Text
                type="body"
                color={colors.white}
                style={styles.noResultsText}
              >
                No users found
              </Text>
            </View>
          )}

          {!loading && guests.length === 0 && search.trim() === "" && (
            <EmptyStateContainer
              title="No Guests Found"
              description="Follow some people so you can invite them to your events..."
              icon="user-plus"
            />
          )}

          {!loading && guests.length > 0 && (
            <View style={styles.usersContainer}>
              {guests.map((guest) => (
                <EventInviteGuestItem
                  key={guest.user.uid}
                  guest={guest}
                  event={event}
                  refreshInvites={refreshInvites}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkGray,
    flex: 1,
    gap: 12
  },
  contentContainer: {
    alignItems: "center",
    marginHorizontal: 16
  },
  loader: {
    marginTop: 24
  },
  noResultsContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginHorizontal: 12,
    marginTop: 12
  },
  noResultsText: {
    color: colors.white,
    flex: 1,
    flexShrink: 1,
    textAlign: "left"
  },
  usersContainer: {
    alignItems: "center",
    gap: 12,
    width: "100%"
  }
});
