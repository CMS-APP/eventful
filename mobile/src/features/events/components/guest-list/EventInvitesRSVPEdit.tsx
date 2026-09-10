import { useSelector } from "react-redux";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert, StyleSheet, View } from "react-native";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { EventsStackParamList } from "@/app/navigation";
import { SegmentedControl } from "@/design-system/components/buttons/SegmentedControl";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getEventInfo } from "@/services/firebase/event";
import {
  getRSVPAppUsers,
  getRSVPManualUsers,
  getRSVPWebUsers
} from "@/services/firebase/invite";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { UserInvite } from "@/types/UserInvite";
import { parseDatabaseDate } from "@/utils/date";

import { EventInviteMoreRow } from "./EventInviteMoreRow";
import { EventInvitesRSVPUserList } from "./EventInvitesRSVPUserList";
import { EventInvitesStatsCard } from "./EventInvitesStatsCard";

interface EventInvitesRSVPEditProps {
  event: Event;
  setEvent: (event: Event) => void;
  saveNow: (updater: Event | ((prev: Event) => Event)) => Promise<void>;
}

export function EventInvitesRSVPEdit({
  event,
  setEvent,
  saveNow
}: EventInvitesRSVPEditProps) {
  const [fetchingData, setFetchingData] = useState(false);
  const [appList, setAppList] = useState<UserInvite[]>([]);
  const [linkList, setLinkList] = useState<UserInvite[]>([]);
  const [manualList, setManualList] = useState<UserInvite[]>([]);
  const [userList, setUserList] = useState<UserInvite[]>([]);
  const [selectedButton, setSelectedButton] = useState("accept");
  const [acceptNum, setAcceptNum] = useState(0);
  const [maybeNum, setMaybeNum] = useState(0);
  const [declineNum, setDeclineNum] = useState(0);
  const userId = useSelector((state: UserState) => state.uid);
  const navigation =
    useNavigation() as StackNavigationProp<EventsStackParamList>;

  const saveValues = useCallback((allUsers: UserInvite[]) => {
    const acceptCount = allUsers.filter(
      (user: UserInvite) => user.invite.response === "accept"
    ).length;
    const maybeCount = allUsers.filter(
      (user: UserInvite) => user.invite.response === "maybe"
    ).length;
    const declineCount = allUsers.filter(
      (user: UserInvite) => user.invite.response === "decline"
    ).length;
    setAcceptNum(acceptCount);
    setMaybeNum(maybeCount);
    setDeclineNum(declineCount);
  }, []);

  const getUserList = useCallback(
    (allUsers: UserInvite[]) => {
      const filteredUsers = allUsers.filter((user: UserInvite) => {
        return user.invite.response === selectedButton;
      });

      setUserList(filteredUsers);
    },
    [selectedButton]
  );

  const fetchData = useCallback(async () => {
    setFetchingData(true);
    const eventData = await getEventInfo({ id: event.id } as Event);
    const appUsers = await getRSVPAppUsers(eventData as Event);
    setAppList(appUsers);
    const linkUsers =
      userId && userId !== "null"
        ? await getRSVPWebUsers(eventData as Event, userId)
        : [];
    setLinkList(linkUsers);
    const manualUsers = await getRSVPManualUsers(eventData as Event);
    setManualList(manualUsers);

    const allUsers = [...appUsers, ...linkUsers, ...manualUsers];
    saveValues(allUsers);
    setFetchingData(false);
  }, [event.id, userId, saveValues]);

  const selections = useMemo(() => ["accept", "maybe", "decline"], []);
  const selectionValues = useMemo(
    () => [acceptNum.toString(), maybeNum.toString(), declineNum.toString()],
    [acceptNum, maybeNum, declineNum]
  );

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    const allUsers = [...appList, ...linkList, ...manualList];
    getUserList(allUsers);
  }, [selectedButton, appList, linkList, manualList, getUserList]);

  const openInviteFriends = useCallback(() => {
    const date = new Date();
    if (parseDatabaseDate(event.date) < date) {
      Alert.alert(
        "Unable to Invite Guests",
        "You can't invite guests to a past events"
      );
      return;
    }

    (navigation as StackNavigationProp<EventsStackParamList>).navigate(
      "EventInviteGuest",
      { event }
    );
  }, [event, navigation]);

  const openInviteLink = useCallback(() => {
    const date = new Date();
    if (parseDatabaseDate(event.date) < date) {
      Alert.alert(
        "Unable to Invite Guests",
        "You can't invite guests to a past events"
      );
      return;
    }
    (navigation as StackNavigationProp<EventsStackParamList>).navigate(
      "EventInviteGuestLink",
      { event, linkList: linkList }
    );
  }, [event, navigation, linkList]);

  const openManualGuest = useCallback(() => {
    (navigation as StackNavigationProp<EventsStackParamList>).navigate(
      "EventInviteGuestManual",
      { event }
    );
  }, [event, navigation]);

  const totalGuests = appList.length + linkList.length + manualList.length;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <EventInvitesStatsCard
          total={totalGuests}
          acceptNum={acceptNum}
          maybeNum={maybeNum}
          declineNum={declineNum}
        />
      </View>

      <Text type="caption" color={colors.gray} style={styles.sectionLabel}>
        Invite More
      </Text>
      <View style={styles.section}>
        <EventInviteMoreRow
          icon="users"
          label="In-App Friends"
          count={appList.length}
          onPress={openInviteFriends}
        />

        <EventInviteMoreRow
          icon="link"
          label="Invite Via Link"
          count={linkList.length}
          onPress={openInviteLink}
        />

        <EventInviteMoreRow
          icon="user-plus"
          label="Manual Guests"
          count={manualList.length}
          onPress={openManualGuest}
        />
      </View>

      <SegmentedControl
        selections={selections}
        selectionValues={selectionValues}
        selectedButton={selectedButton}
        setSelectedButton={setSelectedButton}
        nonPressColor={colors.white}
        disabled={fetchingData}
      />

      <EventInvitesRSVPUserList
        event={event}
        setEvent={setEvent}
        saveNow={saveNow}
        userList={userList}
        fetchingData={fetchingData}
        fetchData={fetchData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkGray,
    flex: 1
  },
  section: {
    gap: 8,
    paddingBottom: 16,
    paddingHorizontal: 16
  },
  sectionLabel: {
    marginBottom: 8,
    paddingHorizontal: 16,
    textAlign: "left"
  }
});
