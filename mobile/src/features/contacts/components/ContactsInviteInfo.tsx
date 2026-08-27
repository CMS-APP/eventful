import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { ContactsStackParamList } from "@/app/navigationTypes";
import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { Button } from "@/design-system/components/Button";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { getInvitationsForUser } from "@/services/firebase/firebaseInviteFunctions";
import { UserState } from "@/store/UserSlice";
import { EventInvite } from "@/types/EventInvite";
import { Invites } from "@/types/Invites";
import { parseDatabaseDate } from "@/utils/date";

import { ContactInviteItem } from "./ContactInviteItem";

export function ContactsInviteInfo() {
  const navigation =
    useNavigation() as StackNavigationProp<ContactsStackParamList>;
  const [sortedInvites, setSortedInvites] = useState<Invites>({
    respond: [],
    noRespond: []
  });

  const [invites, setInvites] = useState<EventInvite[]>([]);
  const userId = useSelector((state: UserState) => state.uid);

  const fetchData = useCallback(async () => {
    const invitations = await getInvitationsForUser(userId);

    const respond = invitations.respond;
    const noRespond = invitations.noRespond;

    let sortedRespond = respond.sort((a, b) => {
      const dateA = parseDatabaseDate(a.event.date).getTime();
      const dateB = parseDatabaseDate(b.event.date).getTime();
      return dateA - dateB;
    });

    let sortedNoRespond = noRespond.sort((a, b) => {
      const dateA = parseDatabaseDate(a.event.date).getTime();
      const dateB = parseDatabaseDate(b.event.date).getTime();
      return dateA - dateB;
    });

    setSortedInvites({ respond: sortedRespond, noRespond: sortedNoRespond });

    let sortedAllInvites = [...sortedRespond, ...sortedNoRespond].sort(
      (a, b) => {
        const dateA = parseDatabaseDate(a.event.date).getTime();
        const dateB = parseDatabaseDate(b.event.date).getTime();

        return dateA - dateB;
      }
    );

    setInvites(sortedAllInvites);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  function goToInvites() {
    navigation.navigate("ContactsInvitations", { invites: sortedInvites });
  }

  return (
    <View style={styles.container}>
      <Text type="header" color={colors.black}>
        Invites
      </Text>

      {invites.length > 0 ? (
        <>
          {invites.map((eventInvite: EventInvite) => (
            <ContactInviteItem
              eventInvite={eventInvite}
              key={eventInvite.invite.id}
            />
          ))}
        </>
      ) : (
        <EmptyStateContainer
          title="No Invites"
          description="No invites found"
          icon="inbox"
        />
      )}

      <Button
        text="View All Invites"
        onPress={goToInvites}
        icon="inbox"
        color={colors.primary}
        textColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginTop: 12,
    paddingHorizontal: 24
  }
});
