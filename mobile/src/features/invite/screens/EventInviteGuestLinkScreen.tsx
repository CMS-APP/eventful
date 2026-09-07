import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { Alert, Clipboard, StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { AllStackParamList, EventsStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { Button } from "@/design-system/components/buttons/Button";
import { SegmentedControl } from "@/design-system/components/buttons/SegmentedControl";
import { SwitchButton } from "@/design-system/components/buttons/SwitchButton";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { EventInviteUserItem } from "@/features/events/components/guest-list/EventInviteUserItem";
import { LinkInviteDisclaimerModal } from "@/features/invite/components/LinkInviteDisclaimerModal";
import {
  trackInviteLinkCopied,
  trackInviteSent
} from "@/services/analytics/events";
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
  const url = event
    ? "https://app.eventfulapp.com/event-response/" + event.id
    : "";
  const [enableLinkInvite, setEnableLinkInvite] = useState<boolean | undefined>(
    undefined
  );
  const [acceptNum, setAcceptNum] = useState(0);
  const [maybeNum, setMaybeNum] = useState(0);
  const [declineNum, setDeclineNum] = useState(0);
  const [selectedButton, setSelectedButton] = useState("accept");
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
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
    trackInviteSent("link");
  }

  function copyUrlToClipboard() {
    Clipboard.setString(url);
    trackInviteLinkCopied();

    Alert.alert(
      "Link Copied",
      "The event link has been copied to your clipboard."
    );
  }

  async function handleSwitchChange() {
    if (enableLinkInvite) {
      setEnableLinkInvite(false);
      await changeEventEnabledStatus(event?.id || "", false);
      await updateEventInDatabase({
        id: event?.id || "",
        eventLinkEnabled: false
      });
      return;
    }

    setShowDisclaimerModal(true);
  }

  async function handleAcceptDisclaimer() {
    setShowDisclaimerModal(false);
    setEnableLinkInvite(true);
    await createEventLink();
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
    setEnableLinkInvite(event?.eventLinkEnabled);
  }, [event?.eventLinkEnabled]);

  useEffect(() => {
    getUserNumbers();
    getUsers();
  }, [linkList, selectedButton, getUserNumbers, getUsers]);

  if (!event) {
    return null;
  }

  return (
    <>
      <LinkInviteDisclaimerModal
        presentModal={showDisclaimerModal}
        setPresentModal={setShowDisclaimerModal}
        onAccept={handleAcceptDisclaimer}
      />

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
          <View style={styles.switchContainer}>
            <SwitchButton
              title={"Enable Link Invite"}
              isChecked={enableLinkInvite ?? false}
              onChange={handleSwitchChange}
            />

            {enableLinkInvite && (
              <View style={styles.urlContainer}>
                <FontAwesome5 name="link" size={14} color={colors.black} />
                <Text
                  type="caption"
                  color={colors.black}
                  style={styles.urlText}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {url}
                </Text>
              </View>
            )}

            <View
              style={
                enableLinkInvite
                  ? styles.buttonContainerEnabled
                  : styles.buttonContainerDisabled
              }
            >
              <Button
                size="small"
                color={colors.secondary}
                text={"Copy Invite Link"}
                onPress={copyUrlToClipboard}
                textColor={colors.white}
                disabled={!enableLinkInvite}
                leadingIcon={"copy"}
              />

              {enableLinkInvite && (
                <Text type="caption" color={colors.gray} center>
                  Anyone with this link can respond to the event
                </Text>
              )}
            </View>
          </View>

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
                    deleteGuestManual={async () => {}}
                    setResponseManual={async () => {}}
                  />
                );
              })}
          </View>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainerDisabled: {
    gap: 4,
    opacity: 0.5
  },
  buttonContainerEnabled: {
    gap: 4,
    opacity: 1
  },
  contentContainer: {
    gap: 12
  },
  switchContainer: {
    gap: 12,
    paddingHorizontal: 16
  },
  urlContainer: {
    ...card.small,
    alignItems: "center",
    backgroundColor: colors.white,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  urlText: {
    flex: 1,
    fontStyle: "italic",
    textAlign: "left",
    textTransform: "none"
  },
  userListContainer: {
    gap: 12,
    paddingHorizontal: 16
  }
});
