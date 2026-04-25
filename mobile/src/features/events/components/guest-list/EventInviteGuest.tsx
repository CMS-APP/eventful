import { ActivityIndicator } from "react-native-paper";

import { useCallback } from "react";

import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/components/text/Text";
import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { Screen } from "@/components/views/screen/Screen";
import {
  AllStackParamList,
  EventsStackParamList,
  MainStackParamList
} from "@/features/app/navigationTypes";
import { ContactsSearch } from "@/features/contacts/components/ContactsSearch";
import { colors } from "@/styles/colors";
import { User } from "@/types/User";

import { useEventInviteFollowing } from "../../hooks/useEventInviteFollowing";
import { EventInviteGuestItem } from "./EventInviteGuestItem";

interface EventInviteGuestProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<EventsStackParamList, "EventInviteGuest">;
}

export function EventInviteGuest({ navigation, route }: EventInviteGuestProps) {
  const event = route.params.event;
  const invitedList = event.invited ?? [];

  const {
    filteredInvitedUsers,
    filteredNonInvitedUsers,
    search,
    setSearch,
    refreshInvites
  } = useEventInviteFollowing(navigation, event);

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
          icon: "users",
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
        <ContactsSearch search={search} setSearch={setSearch} />

        <View style={styles.contentContainer}>
          {filteredInvitedUsers === null && (
            <ActivityIndicator
              size={"large"}
              color={colors.secondary}
              style={styles.loader}
            />
          )}

          {filteredInvitedUsers !== null &&
            filteredInvitedUsers.length === 0 &&
            filteredNonInvitedUsers !== null &&
            filteredNonInvitedUsers.length === 0 &&
            search.trim() !== "" && (
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

          <View style={styles.usersContainer}>
            {filteredInvitedUsers !== null &&
              filteredInvitedUsers.length > 0 && (
                <Text type="subHeader" color="white" style={styles.subText}>
                  Invited Users
                </Text>
              )}

            {filteredInvitedUsers !== null &&
              filteredInvitedUsers.map((followingUser: User) => (
                <EventInviteGuestItem
                  key={followingUser.uid}
                  user={followingUser}
                  event={event}
                  invitedList={invitedList}
                  refreshInvites={refreshInvites}
                />
              ))}

            {filteredNonInvitedUsers !== null &&
              filteredNonInvitedUsers.length > 0 && (
                <Text type="subHeader" color="white" style={styles.subText}>
                  Other Users
                </Text>
              )}

            {filteredInvitedUsers !== null &&
              filteredInvitedUsers.length === 0 &&
              filteredNonInvitedUsers !== null &&
              filteredNonInvitedUsers.length === 0 &&
              search.trim() === "" && (
                <EmptyStateContainer
                  title="No Guests Found"
                  description="Follow some people so you can invite them to your events..."
                  icon="user-plus"
                />
              )}

            {filteredNonInvitedUsers !== null &&
              filteredNonInvitedUsers.map((invitedUser: User) => (
                <EventInviteGuestItem
                  key={invitedUser.uid}
                  user={invitedUser}
                  event={event}
                  invitedList={invitedList}
                  refreshInvites={refreshInvites}
                />
              ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkGray,
    flex: 1
  },
  contentContainer: {
    alignItems: "center",
    marginHorizontal: 24
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
  subText: {
    marginTop: 12
  },
  usersContainer: {
    alignItems: "center",
    gap: 12,
    width: "100%"
  }
});
