import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { Alert, Clipboard, StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList, EventsStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { Button } from "@/design-system/components/buttons/Button";
import { SegmentedControl } from "@/design-system/components/buttons/SegmentedControl";
import { SwitchButton } from "@/design-system/components/buttons/SwitchButton";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { padding } from "@/design-system/tokens/padding";
import { EventInviteUserItem } from "@/features/events/components/guest-list/EventInviteUserItem";
import {
  changeEventEnabledStatus,
  updateEventInDatabase
} from "@/services/firebase/event";
import { generateEventLink, getRSVPWebUsers } from "@/services/firebase/invite";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { UserInvite } from "@/types/UserInvite";

interface EventInviteGuestLinkScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<EventsStackParamList, "EventInviteGuestLink">;
}

export function EventInviteGuestLinkScreen({
  navigation,
  route
}: EventInviteGuestLinkScreenProps) {
  const event = route.params?.event;
  const [enableLinkInvite, setEnableLinkInvite] = useState<boolean | undefined>(
    undefined
  );
  const [acceptNum, setAcceptNum] = useState(0);
  const [maybeNum, setMaybeNum] = useState(0);
  const [declineNum, setDeclineNum] = useState(0);
  const [selectedButton, setSelectedButton] = useState("accept");
  const [linkList, setLinkList] = useState(route.params?.linkList || []);
  const [userList, setUserList] = useState(linkList);
  const userId = useSelector((state: UserState) => state.uid);

  const name =
    useSelector((state: UserState) => state.firstName)
      .charAt(0)
      .toUpperCase() +
    useSelector((state: UserState) => state.firstName).slice(1) +
    " " +
    useSelector((state: UserState) => state.lastName)
      .charAt(0)
      .toUpperCase() +
    useSelector((state: UserState) => state.lastName).slice(1);

  async function createEventLink() {
    await generateEventLink(event as Event, name);
    await updateEventInDatabase({
      id: event?.id || "",
      eventLinkEnabled: true
    });
  }

  function copyUrlToClipboard() {
    const url = "https://app.eventfulapp.com/event-response/" + `${event?.id}`;
    Clipboard.setString(url);

    Alert.alert(
      "Link Copied",
      "The event link has been copied to your clipboard."
    );
  }

  async function handleSwitchChange() {
    setEnableLinkInvite(!enableLinkInvite);

    if (!enableLinkInvite) {
      await createEventLink();
    } else {
      await changeEventEnabledStatus(event?.id || "", false);
      await updateEventInDatabase({
        id: event?.id || "",
        eventLinkEnabled: false
      });
    }
  }

  async function refreshLinks() {
    const linkUsers = await getRSVPWebUsers(event as Event, userId);
    setLinkList(linkUsers);
  }

  const getUserNumbers = useCallback(() => {
    const acceptCount = linkList.filter(
      (user: UserInvite) => user.invite.response === "accept"
    ).length;
    const maybeCount = linkList.filter(
      (user: UserInvite) => user.invite.response === "maybe"
    ).length;
    const declineCount = linkList.filter(
      (user: UserInvite) => user.invite.response === "decline"
    ).length;
    setAcceptNum(acceptCount);
    setMaybeNum(maybeCount);
    setDeclineNum(declineCount);
  }, [linkList]);

  const getUsers = useCallback(() => {
    if (selectedButton === "accept") {
      setUserList(
        linkList.filter((user: UserInvite) => user.invite.response === "accept")
      );
    } else if (selectedButton === "maybe") {
      setUserList(
        linkList.filter((user: UserInvite) => user.invite.response === "maybe")
      );
    } else if (selectedButton === "decline") {
      setUserList(
        linkList.filter(
          (user: UserInvite) => user.invite.response === "decline"
        )
      );
    }
  }, [selectedButton, linkList]);

  useEffect(() => {
    async function fetchEventLinkStatus() {
      setEnableLinkInvite(event?.eventLinkEnabled);
    }

    getUserNumbers();
    getUsers();
    fetchEventLinkStatus();
  }, [linkList, event?.eventLinkEnabled, getUserNumbers, getUsers]);

  useEffect(() => {
    getUsers();
  }, [selectedButton, getUsers]);

  if (!event) {
    return null;
  }

  return (
    <Screen
      headerConfig={{
        type: "flat",
        flatHeaderProps: {
          title: "Invite Via Link",
          backgroundColor: colors.darkGray,
          dark: true,
          backAction: true,
          icon: "link"
        },
        backgroundColor: colors.darkGray
      }}
      contentConfig={{
        backgroundColor: colors.darkGray
      }}
    >
      <View style={styles.contentContainer}>
        <View style={styles.linkContainer}>
          <View style={[padding.smallWidget, styles.disclaimerContainer]}>
            <Text type="footnote" color="black">
              Disclaimer: This link will allow anyone to RSVP to your event and
              view the event details and anyone with the link will be able to
              see the event details, such as the location, time and date.
            </Text>
          </View>

          <View style={styles.switchContainer}>
            <SwitchButton
              title={"Enable Link Invite"}
              isChecked={enableLinkInvite ?? false}
              onChange={handleSwitchChange}
            />

            <View
              style={
                enableLinkInvite
                  ? styles.buttonContainerEnabled
                  : styles.buttonContainerDisabled
              }
            >
              <Button
                color={colors.secondary}
                text={"Copy Invite Link"}
                onPress={copyUrlToClipboard}
                textColor={colors.white}
                disabled={!enableLinkInvite}
                leadingIcon={"copy"}
              />
            </View>
          </View>
        </View>

        <Text type="header" color="white" style={styles.responsesHeader} center>
          Link Responses
        </Text>

        <SegmentedControl
          selections={["accept", "maybe", "decline"]}
          selectionValues={[
            acceptNum.toString(),
            maybeNum.toString(),
            declineNum.toString()
          ]}
          selectedButton={selectedButton}
          setSelectedButton={setSelectedButton}
          nonPressColor={colors.white}
        />

        <View style={styles.userListContainer}>
          {userList.length > 0 &&
            userList.map((user: UserInvite, index: number) => {
              return (
                <EventInviteUserItem
                  key={user.user.uid}
                  user={user.user}
                  event={event}
                  refreshUsers={refreshLinks}
                  invite={user.invite}
                  deleteGuestManual={() => {}}
                  setResponseManual={() => {}}
                />
              );
            })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttonContainerDisabled: {
    marginTop: 6,
    opacity: 0.5
  },
  buttonContainerEnabled: {
    marginTop: 6,
    opacity: 1
  },
  contentContainer: {
    gap: 16
  },
  disclaimerContainer: {
    backgroundColor: colors.lightGray
  },
  linkContainer: {
    gap: 16,
    paddingHorizontal: 24
  },
  responsesHeader: {
    marginTop: 20
  },
  switchContainer: {
    gap: 12
  },
  userListContainer: {
    gap: 12,
    marginVertical: 12
  }
});
