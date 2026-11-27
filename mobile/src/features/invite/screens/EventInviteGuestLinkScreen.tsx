import { useSelector } from "react-redux";

import { useMemo, useState } from "react";

import { Alert, Clipboard, StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";

import { EventsStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { Button } from "@/design-system/components/buttons/Button";
import { SegmentedControl } from "@/design-system/components/buttons/SegmentedControl";
import { SwitchButton } from "@/design-system/components/buttons/SwitchButton";
import { SwitchButtonGroup } from "@/design-system/components/buttons/SwitchButtonGroup";
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
  route: RouteProp<EventsStackParamList, "EventInviteGuestLink">;
}

export function EventInviteGuestLinkScreen({
  route
}: EventInviteGuestLinkScreenProps) {
  const event = route.params?.event;
  const url = event
    ? "https://app.eventfulapp.com/event-response/" + event.id
    : "";
  const [enableLinkInvite, setEnableLinkInvite] = useState<boolean | undefined>(
    undefined
  );
  const [prevEventLinkEnabled, setPrevEventLinkEnabled] = useState(
    event?.eventLinkEnabled
  );
  if (event?.eventLinkEnabled !== prevEventLinkEnabled) {
    setPrevEventLinkEnabled(event?.eventLinkEnabled);
    setEnableLinkInvite(event?.eventLinkEnabled);
  }
  const [selectedButton, setSelectedButton] = useState("accept");
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [linkList, setLinkList] = useState(route.params?.linkList || []);
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

  const { acceptNum, maybeNum, declineNum } = useMemo(() => {
    const acceptCount = linkList.filter(
      (user: UserInvite) => user.invite.response === "accept"
    ).length;
    const maybeCount = linkList.filter(
      (user: UserInvite) => user.invite.response === "maybe"
    ).length;
    const declineCount = linkList.filter(
      (user: UserInvite) => user.invite.response === "decline"
    ).length;
    return {
      acceptNum: acceptCount,
      maybeNum: maybeCount,
      declineNum: declineCount
    };
  }, [linkList]);

  const userList = useMemo(() => {
    if (selectedButton === "accept") {
      return linkList.filter(
        (user: UserInvite) => user.invite.response === "accept"
      );
    } else if (selectedButton === "maybe") {
      return linkList.filter(
        (user: UserInvite) => user.invite.response === "maybe"
      );
    } else if (selectedButton === "decline") {
      return linkList.filter(
        (user: UserInvite) => user.invite.response === "decline"
      );
    }
    return [];
  }, [selectedButton, linkList]);

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
            <SwitchButtonGroup>
              <SwitchButton
                icon="link"
                title="Enable Link Invite"
                subtitle="Anyone with the link can RSVP"
                value={enableLinkInvite ?? false}
                onChange={handleSwitchChange}
              />
            </SwitchButtonGroup>

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
  userListContainer: {
    gap: 12,
    paddingHorizontal: 16
  }
});
